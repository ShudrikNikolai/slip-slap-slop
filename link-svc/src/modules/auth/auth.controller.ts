import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser, Public } from './decorators';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenGuard } from './guards';
import { AuthService } from './services/auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('login')
    async login(@Body() loginDto: LoginDto, @Req() req: any, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.login(loginDto, req.session);

        // Устанавливаем cookies
        this.setAuthCookies(res, result.tokens);

        return result;
    }

    @Public()
    @Post('register')
    async register(@Body() registerDto: RegisterDto, @Req() req: any, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.register(registerDto);

        this.setAuthCookies(res, result.tokens);

        return result;
    }

    @Post('refresh')
    @UseGuards(RefreshTokenGuard)
    @ApiBearerAuth()
    async refresh(@Body() refreshTokenDto: RefreshTokenDto, @Res({ passthrough: true }) res: Response) {
        const tokens = await this.authService.refreshTokens(refreshTokenDto);

        this.setAuthCookies(res, tokens);

        return { tokens };
    }

    @Post('logout')
    @ApiBearerAuth()
    async logout(@CurrentUser('id') userId: string, @Res({ passthrough: true }) res: Response) {
        await this.authService.logout(userId);

        // Очищаем cookies
        this.clearAuthCookies(res);

        return { message: 'Logged out successfully' };
    }

    @Post('password/change')
    @ApiBearerAuth()
    async changePassword(
        @CurrentUser('id') userId: string,
        @Body('currentPassword') currentPassword: string,
        @Body('newPassword') newPassword: string,
    ) {
        await this.authService.changePassword(userId, currentPassword, newPassword);
        return { message: 'Password changed successfully' };
    }

    @Get('sessions')
    @ApiBearerAuth()
    async getActiveSessions(@CurrentUser('id') userId: string) {
        const sessions = await this.authService.getActiveSessions(userId);
        return { sessions };
    }

    @Get('me')
    @ApiBearerAuth()
    async getProfile(@CurrentUser('id') userId: any) {
        return this.authService.getUserProfile(userId);
    }

    private setAuthCookies(res: Response, tokens: any) {
        // TODO
        // Устанавливаем cookies для веб-приложений
        res.cookie('access_token', tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: tokens.expiresIn * 1000, // в миллисекундах
        });

        res.cookie('refresh_token', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
        });
    }

    private clearAuthCookies(res: Response) {
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        // @ts-ignore
        if (res.req.session) {
            // @ts-ignore
            res.req.session.destroy();
        }
    }
}
