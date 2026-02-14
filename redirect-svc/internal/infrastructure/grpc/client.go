package grpc

import (
	"context"
	"time"

	pb "github.com/slip-slap-slop/redirect-svc/pkg/grpc"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type Client struct {
	conn   *grpc.ClientConn
	client pb.LinkServiceClient
	logger *zap.Logger
}

func NewClient(addr string, logger *zap.Logger) (*Client, error) {
	conn, err := grpc.Dial(addr,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithDefaultCallOptions(
			grpc.MaxCallRecvMsgSize(10*1024*1024), // 10MB
			grpc.MaxCallSendMsgSize(10*1024*1024),
		),
	)

	if err != nil {
		return nil, err
	}

	return &Client{
		conn:   conn,
		client: pb.NewLinkServiceClient(conn),
		logger: logger,
	}, nil
}

func (c *Client) GetLink(ctx context.Context, shortCode string) (*pb.GetLinkResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()

	req := &pb.GetLinkRequest{
		ShortCode: shortCode,
	}

	start := time.Now()
	resp, err := c.client.GetLink(ctx, req)
	duration := time.Since(start)

	if err != nil {
		c.logger.Error("gRPC GetLink failed",
			zap.String("short_code", shortCode),
			zap.Error(err),
			zap.Duration("duration", duration),
		)
		return nil, err
	}

	if duration > 100*time.Millisecond {
		c.logger.Warn("Slow gRPC call",
			zap.String("short_code", shortCode),
			zap.Duration("duration", duration),
		)
	}

	return resp, nil
}

func (c *Client) Close() error {
	if c.conn != nil {
		return c.conn.Close()
	}
	return nil
}
