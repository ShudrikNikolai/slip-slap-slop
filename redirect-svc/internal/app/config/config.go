package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	// HTTP сервер
	HTTPPort string
	HTTPHost string

	// gRPC клиент
	GRPCAddr    string
	GRPCTimeout time.Duration

	// Redis
	RedisURL      string
	RedisPassword string
	RedisDB       int

	// Очередь аналитики T_T
	AnalyticsQueue   string
	AnalyticsEnabled bool

	// Кэш
	CacheTTL    time.Duration
	CachePrefix string

	// Rate limiting
	RateLimit       int
	RateLimitWindow time.Duration
}

func Load() *Config {
	return &Config{
		HTTPPort:         getEnv("HTTP_PORT", "8080"),
		HTTPHost:         getEnv("HTTP_HOST", "localhost"),
		GRPCAddr:         getEnv("GRPC_ADDR", "127.0.0.1:50001"),
		GRPCTimeout:      getDuration("GRPC_TIMEOUT", 2*time.Second),
		RedisURL:         getEnv("REDIS_URL", "redis:6379"),
		RedisPassword:    getEnv("REDIS_PASSWORD", ""),
		RedisDB:          getInt("REDIS_DB", 0),
		AnalyticsQueue:   getEnv("ANALYTICS_QUEUE", "click_events"),
		AnalyticsEnabled: getBool("ANALYTICS_ENABLED", true),
		CacheTTL:         getDuration("CACHE_TTL", 24*time.Hour),
		CachePrefix:      getEnv("CACHE_PREFIX", "redirect:"),
		RateLimit:        getInt("RATE_LIMIT", 100),
		RateLimitWindow:  getDuration("RATE_LIMIT_WINDOW", time.Second),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if i, err := strconv.Atoi(value); err == nil {
			return i
		}
	}
	return defaultValue
}

func getBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if b, err := strconv.ParseBool(value); err == nil {
			return b
		}
	}
	return defaultValue
}

func getDuration(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if d, err := time.ParseDuration(value); err == nil {
			return d
		}
	}
	return defaultValue
}
