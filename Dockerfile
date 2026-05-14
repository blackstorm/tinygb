FROM node:24-alpine AS web-builder
ARG NPM_REGISTRY=https://registry.npmjs.org
WORKDIR /src/web
RUN npm install -g pnpm@11.1.2 --registry=${NPM_REGISTRY} \
    && pnpm config set registry ${NPM_REGISTRY}
COPY web/package.json web/pnpm-lock.yaml web/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY web/ ./
RUN pnpm build

FROM golang:1.26-alpine AS go-builder
WORKDIR /src
RUN apk add --no-cache git
COPY go.mod go.sum ./
RUN go mod download
COPY . .
COPY --from=web-builder /src/web/dist ./web/dist
ARG VERSION=dev
RUN CGO_ENABLED=0 go build -ldflags="-s -w -X main.version=${VERSION}" -o /out/gobackup .

FROM alpine:latest
RUN apk add --no-cache \
    ca-certificates \
    openssl \
    postgresql18-client \
    tar \
    gzip \
    pigz \
    bzip2 \
    coreutils \
    lzip \
    lzop \
    xz \
    zstd \
    tzdata
COPY --from=go-builder /out/gobackup /usr/local/bin/gobackup
RUN mkdir -p /root/.gobackup
CMD ["/usr/local/bin/gobackup", "run"]
