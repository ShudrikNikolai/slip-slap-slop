package queue

import (
	"context"
	"encoding/json"
	"time"

	"github.com/go-redis/redis/v8"
	"go.uber.org/zap"
)

type ClickEvent struct {
	EventID     string    `json:"event_id"`
	ShortCode   string    `json:"short_code"`
	LinkID      string    `json:"link_id"`
	IPAddress   string    `json:"ip_address"`
	UserAgent   string    `json:"user_agent"`
	Referer     string    `json:"referer"`
	CountryCode string    `json:"country_code"`
	Timestamp   time.Time `json:"timestamp"`
}

type RedisQueue struct {
	client *redis.Client
	stream string
	logger *zap.Logger
}

func NewRedisQueue(url, password string, db int, stream string, logger *zap.Logger) *RedisQueue {
	opt := &redis.Options{
		Addr:     url,
		Password: password,
		DB:       db,
	}

	return &RedisQueue{
		client: redis.NewClient(opt),
		stream: stream,
		logger: logger,
	}
}

func (q *RedisQueue) PublishClick(ctx context.Context, event *ClickEvent) error {
	eventJSON, err := json.Marshal(event)
	if err != nil {
		return err
	}

	_, err = q.client.XAdd(ctx, &redis.XAddArgs{
		Stream: q.stream,
		Values: map[string]interface{}{
			"event": string(eventJSON),
		},
	}).Result()

	if err != nil {
		q.logger.Error("Failed to publish click event",
			zap.String("short_code", event.ShortCode),
			zap.Error(err),
		)
	}

	return err
}

func (q *RedisQueue) Close() error {
	return q.client.Close()
}
