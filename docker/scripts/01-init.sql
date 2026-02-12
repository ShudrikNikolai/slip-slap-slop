-- init-db.sql
-- Создание базы данных srv
SELECT 'CREATE DATABASE srv'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'srv')\gexec

-- Подключаемся к базе srv
\c srv;

-- Включаем расширение для UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Создание таблицы users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    login VARCHAR(64) NOT NULL UNIQUE,
    username VARCHAR(64) NOT NULL,
    auth_method VARCHAR(20) NOT NULL DEFAULT 'local'
        CHECK (auth_method IN ('local', 'oauth', 'email')),
    country VARCHAR(64),
    city VARCHAR(64),
    birth_date TIMESTAMPTZ,
    gender VARCHAR(10) NOT NULL DEFAULT 'none'
        CHECK (gender IN ('none', 'male', 'female')),
    password_hash TEXT,
    hashed_refresh_token TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Создание индексов для таблицы users с проверкой
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_login_unique ON users(login);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users(updated_at);
CREATE INDEX IF NOT EXISTS idx_users_is_deleted ON users(is_deleted);

-- Создание таблицы user_invitations
CREATE TABLE IF NOT EXISTS user_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    code UUID NOT NULL DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_user_invitations_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_user_invitations_code UNIQUE (code)
);

-- Создание индексов для таблицы user_invitations с проверкой
CREATE INDEX IF NOT EXISTS idx_user_invitations_user_id ON user_invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_invitations_expires_at ON user_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_invitations_code ON user_invitations(code);
CREATE INDEX IF NOT EXISTS idx_user_invitations_is_deleted ON user_invitations(is_deleted);

-- Создание таблицы refresh_tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    token TEXT NOT NULL UNIQUE,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    revoked_by VARCHAR(100),
    revoked_reason VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Создание индексов для таблицы refresh_tokens с проверкой
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_is_revoked ON refresh_tokens(token, is_revoked);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id_is_revoked ON refresh_tokens(user_id, is_revoked);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_is_revoked ON refresh_tokens(is_revoked);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_is_deleted ON refresh_tokens(is_deleted);

-- Создание таблицы links
CREATE TABLE IF NOT EXISTS links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    original_url VARCHAR(2048) NOT NULL,
    short_code UUID NOT NULL UNIQUE,
    clicks INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_links_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Создание индексов для таблицы links с проверкой
CREATE UNIQUE INDEX IF NOT EXISTS idx_links_short_code_unique ON links(short_code);
CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_short_code_is_deleted ON links(short_code, is_deleted);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at);
CREATE INDEX IF NOT EXISTS idx_links_is_deleted ON links(is_deleted);

-- Создание комментариев к таблицам (безопасное обновление)
COMMENT ON TABLE users IS 'Таблица пользователей системы';
COMMENT ON COLUMN users.login IS 'Уникальный логин пользователя';
COMMENT ON COLUMN users.username IS 'Отображаемое имя пользователя';
COMMENT ON COLUMN users.auth_method IS 'Метод аутентификации: local, oauth, email';
COMMENT ON COLUMN users.password_hash IS 'Хэш пароля (только для local аутентификации)';
COMMENT ON COLUMN users.hashed_refresh_token IS 'Хэшированный refresh токен';

COMMENT ON TABLE user_invitations IS 'Таблица приглашений пользователей';
COMMENT ON COLUMN user_invitations.code IS 'Уникальный код приглашения';
COMMENT ON COLUMN user_invitations.expires_at IS 'Дата истечения срока действия приглашения';

COMMENT ON TABLE refresh_tokens IS 'Таблица refresh токенов для аутентификации';
COMMENT ON COLUMN refresh_tokens.token IS 'Токен для обновления access токена';
COMMENT ON COLUMN refresh_tokens.is_revoked IS 'Флаг отзыва токена';
COMMENT ON COLUMN refresh_tokens.expires_at IS 'Дата истечения срока действия токена';

COMMENT ON TABLE links IS 'Таблица ссылок пользователей';
COMMENT ON COLUMN links.user_id IS 'Идентификатор пользователя';
COMMENT ON COLUMN links.original_url IS 'Оригинальный URL';
COMMENT ON COLUMN links.short_code IS 'Уникальный короткий код ссылки';
COMMENT ON COLUMN links.clicks IS 'Количество переходов по ссылке';

-- Создание функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Применение триггера к таблице users с проверкой
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;

-- Применение триггера к таблице user_invitations с проверкой
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_invitations_updated_at') THEN
        CREATE TRIGGER update_user_invitations_updated_at
            BEFORE UPDATE ON user_invitations
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;

-- Применение триггера к таблице refresh_tokens с проверкой
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_refresh_tokens_updated_at') THEN
        CREATE TRIGGER update_refresh_tokens_updated_at
            BEFORE UPDATE ON refresh_tokens
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;

-- Применение триггера к таблице links с проверкой
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_links_updated_at') THEN
        CREATE TRIGGER update_links_updated_at
            BEFORE UPDATE ON links
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;

-- Создание пользователя для приложения с проверкой
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'srv_user') THEN
        CREATE USER srv_user WITH PASSWORD 'srv_password';
    END IF;
END$$;

-- Выдача прав (безопасно, можно выполнять несколько раз)
GRANT CONNECT ON DATABASE srv TO srv_user;
GRANT USAGE ON SCHEMA public TO srv_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO srv_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO srv_user;

-- Даем права на будущие таблицы
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO srv_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO srv_user;
