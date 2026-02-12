import { ConfigService } from '@/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../user/entities/user.entity';
import { UserRepository } from '../../user/repositories/user.repository';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RegisterDto } from '../dto/register.dto';
import { JwtPayload, LoginResponse, RefreshTokenPayload, Tokens } from '../interfaces/tokens.interface';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { SessionService } from './session.service';

const DEFAULT_TIME = 7 * 24 * 60 * 60 * 1000;
// TODO
@Injectable()
export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly refreshTokenRepository: RefreshTokenRepository,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly sessionService: SessionService,
    ) {}

    async login(loginDto: LoginDto, session?: any): Promise<LoginResponse> {
        if (!loginDto?.login) {
            throw new UnauthorizedException();
        }

        const user = await this.validateUser(loginDto.login, loginDto.password);

        console.log('User login >>>', user);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const tokens = await this.generateTokens(user);

        // Сохраняем refresh token в базу
        await this.refreshTokenRepository.createRefreshToken(
            user.id,
            tokens.refreshToken,
            new Date(Date.now() + 860000), // TODO CONFIG GET REFRESH TOKEN
        );

        // Сохраняем сессию (если используется)
        let sessionId;
        if (session) {
            session.user = user.getPublicData();
            sessionId = session.id;
        }

        // Создаем сессию в Redis
        if (this.configService.auth.sessionEnabled) {
            await this.sessionService.createSession(user.id, sessionId);
        }

        return {
            user: user.getPublicData(),
            tokens,
            sessionId,
        };
    }

    async getUserProfile(userId: string): Promise<User | null> {
        return this.userRepository.findUserById(userId);
    }

    async register(registerDto: RegisterDto): Promise<LoginResponse> {
        console.error('Test >>>');

        // Проверяем, существует ли пользователь
        const existingUser = await this.userRepository.findByLogin(registerDto.login);
        console.error('Test >>>', existingUser);

        if (existingUser) {
            throw new UnauthorizedException('User already exist');
        }

        // Хэшируем пароль
        const saltRounds = 10;
        const password = await bcrypt.hash(registerDto.password, saltRounds);

        console.log('Test >password >>', { password, registerDto });
        // Создаем пользователя с транзакцией
        const user = await this.userRepository.createWithTransaction({
            username: registerDto.username || registerDto.login,
            login: registerDto.login,
            password: registerDto.password,
            passwordHash: password,
            authMethod: 'local',
        });

        // Генерируем токены для автоматического логина после регистрации
        const tokens = await this.generateTokens(user);

        // Сохраняем refresh token
        await this.refreshTokenRepository.createRefreshToken(
            user.id,
            tokens.refreshToken,
            new Date(Date.now() + this.configService.auth.jwtExpiration || DEFAULT_TIME),
        );

        return {
            user: user.getPublicData(),
            tokens,
        };
    }

    async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<Tokens> {
        try {
            // Верифицируем refresh token
            const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
                secret: this.configService.auth.jwtSecret,
            }) as RefreshTokenPayload;

            // Находим refresh token в базе
            const storedToken = await this.refreshTokenRepository.findByToken(payload.jti);

            if (!storedToken || !storedToken.isValid()) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            // Находим пользователя
            const user = await this.userRepository.findById(payload.sub);

            if (!user || user.isDeleted) {
                throw new UnauthorizedException('User not found or inactive');
            }

            // Отзываем старый refresh token
            await this.refreshTokenRepository.revokeToken('system', 'Refreshed');

            // Генерируем новые токены
            const tokens = await this.generateTokens(user);

            // Сохраняем новый refresh token
            await this.refreshTokenRepository.createRefreshToken(
                user.id,
                tokens.refreshToken,
                new Date(Date.now() + this.configService.auth.jwtExpiration || DEFAULT_TIME),
            );

            return tokens;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Refresh token expired');
            }
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async logout(userId: string): Promise<void> {
        // Отзываем все refresh tokens пользователя
        await this.refreshTokenRepository.revokeAllForUser(userId, 'system');

        // Удаляем сессии из Redis
        if (this.configService.auth.sessionEnabled) {
            await this.sessionService.destroyUserSessions(userId);
        }
    }

    async logoutFromDevice(userId: string, refreshToken: string): Promise<void> {
        await this.refreshTokenRepository.revokeToken(refreshToken, userId, 'User logged out from device');
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
        const user = await this.userRepository.findById(userId);

        if (!user || !user.passwordHash) {
            throw new UnauthorizedException('User not found');
        }

        // Проверяем текущий пароль
        const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        // Хэшируем новый пароль
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);

        await this.userRepository.updateUserById(user.id, { passwordHash });

        // Отзываем все существующие токены пользователя
        await this.refreshTokenRepository.revokeAllForUser(user.id, 'system');

        return true;
    }

    private async generateTokens(user: User): Promise<Tokens> {
        const accessTokenPayload: JwtPayload = {
            sub: user.id,
            username: user.username,
            login: user.login,
            type: 'access',
            iat: Math.floor(Date.now() / 1000),
        };

        const accessTokenOptions: JwtSignOptions = {
            secret: this.configService.auth.jwtSecret,
            expiresIn: this.parseExpiryStringToSeconds(this.configService.auth.jwtExpiration),
        };

        const refreshTokenOptions: JwtSignOptions = {
            secret: this.configService.auth.jwtRefreshSecret,
            expiresIn: this.parseExpiryStringToSeconds(this.configService.auth.jwtRefreshExpiration),
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(accessTokenPayload, accessTokenOptions),
            this.jwtService.signAsync(
                {
                    sub: user.id,
                    jti: uuidv4(),
                    type: 'refresh',
                    iat: Math.floor(Date.now() / 1000),
                },
                refreshTokenOptions,
            ),
        ]);

        // Вычисляем время жизни токенов
        const accessTokenExpiresIn = this.parseExpiryStringToSeconds(this.configService.auth.jwtExpiration);

        const refreshTokenExpiresIn = this.parseExpiryStringToSeconds(this.configService.auth.jwtRefreshExpiration);

        return {
            accessToken,
            refreshToken,
            expiresIn: accessTokenExpiresIn,
            tokenType: 'Bearer',
            refreshExpiresIn: refreshTokenExpiresIn,
        };
    }

    async getActiveSessions(userId: string): Promise<any[]> {
        if (this.configService.auth.sessionEnabled) {
            return this.sessionService.getUserSessions(userId);
        }

        // Возвращаем refresh tokens как альтернативу
        return this.refreshTokenRepository.findMany({ userId, isRevoked: false }, undefined, { createdAt: 'DESC' });
    }

    async validateUser(login: string, password: string): Promise<User | null> {
        const user = await this.userRepository.findByLogin(login);

        if (!user || user.isDeleted || !user.passwordHash) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return null;
        }

        return user;
    }

    private parseExpiryStringToSeconds(expiry: string | number): number {
        // Если уже число, возвращаем как есть
        if (typeof expiry === 'number') {
            return expiry;
        }

        // Если строка содержит только цифры
        if (/^\d+$/.test(expiry)) {
            return parseInt(expiry, 10);
        }

        // Парсинг строк формата "15m", "1h", "7d"
        const match = expiry.match(/^(\d+)([smhd])$/);
        if (match) {
            const value = parseInt(match[1], 10);
            const unit = match[2];

            const multipliers: Record<string, number> = {
                s: 1, // секунды
                m: 60, // минуты
                h: 60 * 60, // часы
                d: 24 * 60 * 60, // дни
            };

            return value * (multipliers[unit] || 1);
        }

        // Если формат не распознан, возвращаем 15 минут по умолчанию
        console.warn(`Unrecognized expiry format: ${expiry}. Using default 15 minutes.`);
        return 900;
    }
}
