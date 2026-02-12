export interface Tokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number; // Время жизни access токена в секундах
    tokenType: string;
    refreshExpiresIn?: number; // Время жизни refresh токена в секундах
}

export interface JwtPayload {
    sub: string | number;
    id?: string;
    username?: string;
    login?: string;
    role?: string;
    jti?: string;
    iat?: number;
    exp?: number;
    type?: 'access' | 'refresh' | 'reset' | 'verify';
}

export interface RefreshTokenPayload {
    sub: string;
    jti: string;
    iat?: number;
    exp?: number;
}

export interface LoginResponse {
    user: any;
    tokens: Tokens;
    sessionId?: any;
}

export interface AuthRequest extends Request {
    user: JwtPayload;
}
