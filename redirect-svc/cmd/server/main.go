package main

import (
	"flag"
	"log"

	"github.com/slip-slap-slop/redirect-svc/internal/app"
	"github.com/slip-slap-slop/redirect-svc/internal/pkg/logger"
	"go.uber.org/zap"
)

func main() {
	debug := flag.Bool("debug", false, "Enable debug mode")
	flag.Parse()

	if err := logger.Init(*debug); err != nil {
		log.Fatalf("Failed to init logger: %v", err)
	}
	log := logger.Log

	application, err := app.New()
	if err != nil {
		log.Fatal("Failed to create app", zap.Error(err))
	}

	if err := application.Run(); err != nil {
		log.Fatal("App run failed", zap.Error(err))
	}
}
