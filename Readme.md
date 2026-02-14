# Проект сокращения ссылок (Shortlink Service)

Микросервисная архитектура для создания коротких ссылок, редиректов и сбора аналитики. Состоит из трёх(двух T_T) основных сервисов и вспомогательной инфраструктуры.

## Архитектура
- **Link Service** — управление ссылками, пользователи, авторизация (JWT), REST API для фронтенда, gRPC API для внутренних сервисов.
- **Redirect Service** — высоконагруженный редирект, кэширование в Redis, отправка событий в очередь.
- **Analytics Service** — сбор и агрегация событий, live-дашборд через WebSocket/SSE (опционально).
- **PostgreSQL** — основная БД (users, links, invitations).
- **Redis** — кэш, очереди, временные данные.
- **Traefik** — API Gateway (маршрутизация, балансировка, SSL).

## Требования

- Docker и Docker Compose (рекомендуется)
- Node.js v18+ (для локальной разработки link-svc)
- Go 1.21+ (для локальной разработки redirect-svc)
- Make (опционально)

## Запуск через Docker Compose

- Клонируйте репозиторий
```bash
git clone <url>
cd shortlink 
```

- Запустите все сервисы
```
docker compose up -d
```

### После успешного запуска будут доступны:
- Link Service HTTP: `http://link.localhost` (настроено через Traefik)
- Redirect Service: `http://go.localhost`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

### Запуск скрипта sql
- Выполнить SQL из файла:
```
cat 01-init.sql | docker exec -i svc_psql psql -U postgres -d srv
```
```
docker exec -i svc_psql psql -U postgres -d srv < 01-init.sql
```

- Выполнить многострочный SQL напрямую:
```
docker exec -i svc_psql psql -U postgres -d srv <<EOF
SELECT * FROM links WHERE short_code = '4519d147-306c-47bc-84bf-15684a42f9f8';
INSERT INTO links (id, user_id, original_url, short_code, clicks, is_deleted)
VALUES (gen_random_uuid(), 
        (SELECT id FROM users LIMIT 1), 
        'https://example.com', 
        '4519d147-306c-47bc-84bf-15684a42f9f8', 
        0, 
        false);
EOF
```
