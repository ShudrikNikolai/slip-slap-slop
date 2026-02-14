package app

import (
	"context"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"

	"github.com/slip-slap-slop/redirect-svc/internal/app/config"
	"github.com/slip-slap-slop/redirect-svc/internal/delivery/http"
	"github.com/slip-slap-slop/redirect-svc/internal/delivery/http/middleware"
	"github.com/slip-slap-slop/redirect-svc/internal/domain/link"
	"github.com/slip-slap-slop/redirect-svc/internal/infrastructure/cache"
	"github.com/slip-slap-slop/redirect-svc/internal/infrastructure/grpc"
	"github.com/slip-slap-slop/redirect-svc/internal/infrastructure/queue"
	"github.com/slip-slap-slop/redirect-svc/internal/pkg/logger"
)

type App struct {
	config     *config.Config
	logger     *zap.Logger
	httpServer *fiber.App
	grpcClient *grpc.Client
	cache      *cache.RedisCache
	queue      *queue.RedisQueue
}

func New() (*App, error) {
	cfg := config.Load()

	if err := logger.Init(os.Getenv("DEBUG") == "true"); err != nil {
		return nil, err
	}
	log := logger.Log

	app := &App{
		config: cfg,
		logger: log,
	}

	if err := app.initDependencies(); err != nil {
		return nil, err
	}

	app.initHTTPServer()

	return app, nil
}

func (a *App) initDependencies() error {
	var err error

	a.grpcClient, err = grpc.NewClient(a.config.GRPCAddr, a.logger)
	if err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	a.cache = cache.NewRedisCache(
		a.config.RedisURL,
		a.config.RedisPassword,
		a.config.RedisDB,
		a.config.CachePrefix,
		a.config.CacheTTL,
		a.logger,
	)

	if a.config.AnalyticsEnabled {
		a.queue = queue.NewRedisQueue(
			a.config.RedisURL,
			a.config.RedisPassword,
			a.config.RedisDB,
			a.config.AnalyticsQueue,
			a.logger,
		)
	}

	if err := a.cache.Ping(ctx); err != nil {
		a.logger.Warn("Redis ping failed", zap.Error(err))
	}

	return nil
}

func (a *App) initHTTPServer() {
	linkService := link.NewLinkService(
		a.grpcClient,
		a.cache,
		a.logger,
	)

	handler := http.NewHandler(linkService, a.logger)

	a.httpServer = fiber.New(fiber.Config{
		AppName:               "redirect-svc",
		DisableStartupMessage: true,
		ReadTimeout:           10 * time.Second,
		WriteTimeout:          10 * time.Second,
		IdleTimeout:           120 * time.Second,
	})

	middleware.SetupMiddlewares(a.httpServer, a.logger)

	a.httpServer.Get("/health", handler.HealthCheck)
	a.httpServer.Get("/:code", handler.Redirect)

	a.httpServer.Use(func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Not found",
		})
	})
}

func (a *App) Run() error {
	// Канал для graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	serverErr := make(chan error, 1)
	go func() {
		addr := a.config.HTTPHost + ":" + a.config.HTTPPort
		a.logger.Info("Starting HTTP server", zap.String("addr", addr))
		if err := a.httpServer.Listen(addr); err != nil {
			serverErr <- err
		}
	}()

	// Ожидаем сигнал или ошибку
	select {
	case err := <-serverErr:
		return err
	case <-quit:
		a.logger.Info("Shutdown signal received")
		return a.Shutdown()
	}
}

func (a *App) Shutdown() error {
	a.logger.Info("Shutting down...")

	if a.httpServer != nil {
		if err := a.httpServer.Shutdown(); err != nil {
			a.logger.Error("HTTP server shutdown error", zap.Error(err))
		}
	}

	if a.grpcClient != nil {
		a.grpcClient.Close()
	}
	if a.cache != nil {
		a.cache.Close()
	}
	if a.queue != nil {
		a.queue.Close()
	}

	a.logger.Info("Shutdown completed")
	return nil
}
