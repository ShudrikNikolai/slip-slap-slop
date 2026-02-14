#!/bin/bash

echo "=== Generating Go proto files ==="

mkdir -p pkg/grpc

protoc \
  --proto_path=./proto \
  --go_out=./pkg/grpc \
  --go_opt=paths=source_relative \
  --go-grpc_out=./pkg/grpc \
  --go-grpc_opt=paths=source_relative \
  link.proto

echo "✅ Generated"
ls -la pkg/grpc/