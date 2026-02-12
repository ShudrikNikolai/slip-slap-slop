@echo off
echo Gen gRPC...

cd ..

npx protoc --plugin=protoc-gen-ts_proto=.\node_modules\.bin\protoc-gen-ts_proto.cmd `
  --ts_proto_out=src/grpc/ `
  --ts_proto_opt=nestJs=true `
  ./link.proto

echo Done
pause
