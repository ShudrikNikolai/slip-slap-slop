package cache

import (
	"context"
	"time"

	"github.com/go-redis/redis/v8"
	"go.uber.org/zap"
)

type RedisCache struct {
	client *redis.Client
	prefix string
	logger *zap.Logger
	ttl    time.Duration
}

func NewRedisCache(url, password string, db int, prefix string, ttl time.Duration, logger *zap.Logger) *RedisCache {
	opt := &redis.Options{
		Addr:     url,
		Password: password,
		DB:       db,
	}

	return &RedisCache{
		client: redis.NewClient(opt),
		prefix: prefix,
		logger: logger,
		ttl:    ttl,
	}
}

func (c *RedisCache) Get(ctx context.Context, key string) (string, error) {
	fullKey := c.prefix + key

	val, err := c.client.Get(ctx, fullKey).Result()
	if err == redis.Nil {
		return "", nil
	} else if err != nil {
		c.logger.Error("Redis Get failed",
			zap.String("key", key),
			zap.Error(err),
		)
		return "", err
	}

	return val, nil
}

func (c *RedisCache) Set(ctx context.Context, key, value string) error {
	fullKey := c.prefix + key

	err := c.client.Set(ctx, fullKey, value, c.ttl).Err()
	if err != nil {
		c.logger.Error("Redis Set failed",
			zap.String("key", key),
			zap.Error(err),
		)
	}

	return err
}

func (c *RedisCache) Delete(ctx context.Context, key string) error {
	fullKey := c.prefix + key
	return c.client.Del(ctx, fullKey).Err()
}

func (c *RedisCache) Ping(ctx context.Context) error {
	return c.client.Ping(ctx).Err()
}

func (c *RedisCache) Close() error {
	return c.client.Close()
}
