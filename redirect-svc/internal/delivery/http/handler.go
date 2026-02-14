package http

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"

	"github.com/slip-slap-slop/redirect-svc/internal/domain/link"
)

type Handler struct {
	linkService *link.LinkService
	logger      *zap.Logger
}

func NewHandler(linkService *link.LinkService, logger *zap.Logger) *Handler {
	return &Handler{
		linkService: linkService,
		logger:      logger,
	}
}

func (h *Handler) Redirect(c *fiber.Ctx) error {
	start := time.Now()
	shortCode := c.Params("code")

	if shortCode == "favicon.ico" {
		h.logger.Debug("Ignoring favicon.ico request")
		return c.SendStatus(fiber.StatusNoContent)
	}

	if shortCode == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Short code is required",
		})
	}

	req := &link.RedirectRequest{
		ShortCode: shortCode,
		IP:        c.IP(),
		UserAgent: c.Get("User-Agent"),
		Referer:   c.Get("Referer"),
	}

	// ЛОГИРУЕМ ВРЕМЯ ДО gRPC
	beforeGrpc := time.Now()
	result, err := h.linkService.Redirect(c.Context(), req)
	grpcDuration := time.Since(beforeGrpc)

	h.logger.Info("⏱️ gRPC call",
		zap.String("short_code", shortCode),
		zap.Duration("duration", grpcDuration),
		zap.Error(err),
	)

	if err != nil {
		h.logger.Error("Redirect failed",
			zap.String("short_code", shortCode),
			zap.Duration("grpc_duration", grpcDuration),
			zap.Error(err),
		)

		switch err {
		case link.ErrLinkNotFound:
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Link not found",
			})
		case link.ErrLinkInactive:
			return c.Status(fiber.StatusGone).JSON(fiber.Map{
				"error": "Link is inactive",
			})
		case link.ErrLinkExpired:
			return c.Status(fiber.StatusGone).JSON(fiber.Map{
				"error": "Link has expired",
			})
		default:
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Internal server error",
			})
		}
	}

	totalDuration := time.Since(start)

	// Логируем успешный редирект
	h.logger.Info("Redirect success",
		zap.String("short_code", shortCode),
		zap.Bool("from_cache", result.FromCache),
		zap.String("to", result.URL),
		zap.Duration("grpc_duration", grpcDuration),
		zap.Duration("total_duration", totalDuration),
	)

	// Редирект
	return c.Redirect(result.URL, fiber.StatusMovedPermanently)
}

func (h *Handler) HealthCheck(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"status":    "ok",
		"timestamp": time.Now().Unix(),
		"service":   "redirect-svc",
	})
}
