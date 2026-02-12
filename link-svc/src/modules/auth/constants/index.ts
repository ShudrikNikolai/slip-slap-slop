const CONSTS = {
    JWT: 'jwt',
    LOCAL: 'local',
    JWT_REFRESH: 'jwt-refresh',
    D_IS_PUBLIC_KEY: 'isPublic',
    D_ROLES_KEY: 'roles',
    SESSION_PREFIX: 'session:',
    USER_SESSION_PREFIX: 'user:sessions:',
} as const;
// D_* - decorators
export default CONSTS;
