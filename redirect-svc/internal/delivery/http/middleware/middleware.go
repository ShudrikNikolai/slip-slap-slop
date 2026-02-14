package middleware

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/requestid"
	"go.uber.org/zap"
)

func SetupMiddlewares(app *fiber.App, log *zap.Logger) {
	app.Use(requestid.New())

	app.Use(logger.New(logger.Config{
		Format: "${time} ${ip} ${method} ${path} ${status} ${latency} ${error}\n",
	}))

	app.Use(recover.New(recover.Config{
		EnableStackTrace: true,
	}))

	app.Use(func(c *fiber.Ctx) error {
		return c.Next()
	})

	app.Use(func(c *fiber.Ctx) error {
		c.Set("Access-Control-Allow-Origin", "*")
		c.Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		c.Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Method() == "OPTIONS" {
			return c.SendStatus(fiber.StatusNoContent)
		}

		return c.Next()
	})
}
