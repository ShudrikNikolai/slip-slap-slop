#!/bin/bash

echo 'Gen proto...'

PROJECT_ROOT=$(cd "$(dirname "$0")/.." && pwd)

PROTO_DIR="$PROJECT_ROOT/proto"
OUT_DIR="$PROJECT_ROOT/src/grpc"
PLUGIN="$PROJECT_ROOT/node_modules/.bin/protoc-gen-ts_proto.cmd"

mkdir -p "$OUT_DIR"

npx protoc \
  --plugin=protoc-gen-ts_proto="$PLUGIN" \
  -I "$PROTO_DIR" \
  --ts_proto_out="$OUT_DIR" \
  --ts_proto_opt=nestJs=true \
  "$PROTO_DIR/link.proto"

echo 'Done...'
