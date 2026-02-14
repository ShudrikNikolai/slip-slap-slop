# Redirect Service (Golang)

Высокопроизводительный сервис редиректов. Принимает короткие ссылки и перенаправляет на оригинальные URL с использованием кэширования и отправкой аналитики.

## Стек технологий

- **Go 1.21+**
- **Fiber** — HTTP фреймворк
- **gRPC** — клиент для связи с link-svc
- **Redis** — кэш и очередь аналитики
- **Zap** — логирование

## Требования

- Go 1.21+
- Redis 7+
- Docker и Docker Compose (опционально)

## Запуск

- Из корня redirect-svc:
```
go run cmd/server/main.go
```

- Если нужны аргументы:
```
go run cmd/server/main.go -debug
```

- Через Docker:
```
docker build -t redirect-svc .
docker run -p 8080:8080 redirect-svc
```
