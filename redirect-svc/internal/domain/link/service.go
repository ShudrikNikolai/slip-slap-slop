package link

import (
	"context"
	"time"

	pb "github.com/slip-slap-slop/redirect-svc/pkg/grpc"

	"go.uber.org/zap"
)

type LinkService struct {
	grpcClient GRPCClient
	cache      Cache
	logger     *zap.Logger
}

type GRPCClient interface {
	GetLink(ctx context.Context, shortCode string) (*pb.GetLinkResponse, error)
}

type Cache interface {
	Get(ctx context.Context, key string) (string, error)
	Set(ctx context.Context, key, value string) error
}

// Ответ от gRPC
type LinkResponse struct {
	ID          string
	OriginalURL string
	ShortCode   string
	UserID      string
	IsActive    bool
	Clicks      int64
	ExpiresAt   *time.Time
}

type RedirectRequest struct {
	ShortCode string
	IP        string
	UserAgent string
	Referer   string
}

type RedirectResult struct {
	URL       string
	FromCache bool
	LinkID    string
}

func NewLinkService(grpcClient GRPCClient, cache Cache, logger *zap.Logger) *LinkService {
	return &LinkService{
		grpcClient: grpcClient,
		cache:      cache,
		logger:     logger,
	}
}

func (s *LinkService) Redirect(ctx context.Context, req *RedirectRequest) (*RedirectResult, error) {
	start := time.Now()

	cachedURL, err := s.cache.Get(ctx, req.ShortCode)
	if err == nil && cachedURL != "" {
		go s.sendAnalytics(req, start, true)

		return &RedirectResult{
			URL:       cachedURL,
			FromCache: true,
		}, nil
	}

	link, err := s.grpcClient.GetLink(ctx, req.ShortCode)
	if err != nil {
		s.logger.Error("Failed to get link",
			zap.String("short_code", req.ShortCode),
			zap.Error(err),
		)
		return nil, err
	}

	s.cache.Set(ctx, req.ShortCode, link.OriginalUrl)

	go s.sendAnalytics(req, start, false)

	s.logger.Info("Redirect processed",
		zap.String("short_code", req.ShortCode),
		zap.Duration("duration", time.Since(start)),
		zap.Bool("cached", false),
	)

	return &RedirectResult{
		URL:       link.OriginalUrl,
		FromCache: false,
		LinkID:    link.Id,
	}, nil
}

func (s *LinkService) sendAnalytics(req *RedirectRequest, start time.Time, fromCache bool) {
}

func generateEventID() string {
	return time.Now().Format("20060102150405") + "-" + randomString(8)
}

func randomString(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[time.Now().UnixNano()%int64(len(letters))]
	}
	return string(b)
}

var (
	ErrLinkNotFound = &RedirectError{Code: "LINK_NOT_FOUND", Message: "Link not found"}
	ErrLinkInactive = &RedirectError{Code: "LINK_INACTIVE", Message: "Link is inactive"}
	ErrLinkExpired  = &RedirectError{Code: "LINK_EXPIRED", Message: "Link has expired"}
	ErrInternal     = &RedirectError{Code: "INTERNAL_ERROR", Message: "Internal server error"}
)

type RedirectError struct {
	Code    string
	Message string
}

func (e *RedirectError) Error() string {
	return e.Message
}
