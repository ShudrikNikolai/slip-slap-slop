# Link Service

Микросервис для управления короткими ссылками, пользователями и инвайтами.  
Реализован на **NestJS** с использованием **TypeORM**, **PostgreSQL**, **Redis** и **gRPC**.

## Функциональность

- Регистрация и аутентификация пользователей (JWT)
- CRUD для коротких ссылок
- gRPC API для внутреннего использования
- REST API для фронтенда
- Интеграция с Redis для кэширования

## Технологии

- Node.js + NestJS
- TypeORM + PostgreSQL
- Redis (кэш)
- gRPC (для межсервисного взаимодействия)
- JWT (аутентификация)

## Запуск

### Локальная разработка

```bash
cd link-svc && yarn install
```

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```
