<p align="center">
<img src="https://user-images.githubusercontent.com/5518/205909959-12b92929-4ac5-4bb5-9111-6f9a3ed76cf6.png" width="160" />
</p>

<h1 align="center">TinyGB</h1>
<p align="center">A tiny, opinionated fork of GoBackup for PostgreSQL + S3 backups.</p>

TinyGB is a heavily pruned fork of [GoBackup](https://github.com/gobackup/gobackup). It keeps the deployment model and configuration style of GoBackup, but narrows the supported surface area for a small, focused backup service.

## How TinyGB differs from GoBackup

TinyGB intentionally removes broad provider support and keeps only the pieces needed for a minimal PostgreSQL-to-S3 backup workflow.

### Kept

- PostgreSQL database backups.
- S3-compatible storage.
- Webhook notifications.
- Archive file/directory backup support.
- `tar` / `tgz` compression.
- OpenSSL encryption.
- Split large backup files into parts.
- Built-in scheduler and daemon mode.
- Built-in Web UI.
- Before / after scripts.
- Environment variable expansion in config files.

### Removed / pruned

- Database adapters other than PostgreSQL.
- Storage adapters other than S3-compatible storage.
- Notifiers other than Webhook.
- Prometheus metrics and the `/metrics` endpoint.
- FTP package replacement and release-download based installer.
- Large Web UI dependencies:
  - Ant Design
  - React Router
  - React Lazy Log
  - Remix Icon
  - React compatibility runtime
- Docker image build no longer downloads binaries from GitHub releases; it builds from source with a multi-stage Dockerfile.

### Web UI changes

Compared with upstream GoBackup, the Web UI is now much smaller:

- Built with Preact.
- Uses `wouter-preact` for tiny routing.
- Uses `lucide-preact` for tree-shaken SVG icons.
- Uses local CSS/Tailwind components instead of Ant Design.
- Uses a lightweight native streaming log viewer instead of `react-lazylog`.

Current Web UI bundle is roughly:

```text
JS gzip:  ~13 KB
CSS gzip: ~3 KB
```

## Supported components

### Databases

- PostgreSQL

### Storages

- Amazon S3 and S3-compatible storage

### Notifiers

- Webhook

### Compression / encryption

- `tar`
- `tgz`
- OpenSSL encryption

## Installation from source

```shell
git clone https://github.com/blackstorm/tinygb.git
cd tinygb
./install
```

After that, you will get:

```text
/usr/local/bin/gobackup
```

The binary name is kept as `gobackup` for compatibility with the original CLI and existing configs.

## Docker

Build locally:

```bash
docker build -t tinygb:latest .
```

Build with a version string:

```bash
docker build --build-arg VERSION=v1.0.0 -t tinygb:v1.0.0 .
```

If your environment needs a custom npm registry for Web UI dependencies:

```bash
docker build \
  --build-arg NPM_REGISTRY=https://registry.npmmirror.com \
  -t tinygb:latest .
```

The runtime image contains the compiled `gobackup` binary and required system tools only.

## Configuration

TinyGB will seek config files in:

- `./gobackup.yml`
- `~/.gobackup/gobackup.yml`
- `/etc/gobackup/gobackup.yml`

Example:

```yml
web:
  host: 0.0.0.0
  port: 2703
  username: gobackup
  password: 123456

models:
  app_backup:
    description: "PostgreSQL and config backup"
    schedule:
      # At 04:05 every day.
      every: "1day"
      at: "04:05"

    before_script: |
      echo "before backup"

    after_script: |
      echo "after backup"

    databases:
      app_db:
        type: postgresql
        host: localhost
        port: 5432
        database: app_production
        username: postgres
        password: $POSTGRES_PASSWORD

    archive:
      includes:
        - /etc/hosts
        - /etc/nginx/nginx.conf
      excludes:
        - /tmp

    compress_with:
      type: tgz
      filename_format: "2006.01.02.15.04.05"

    encrypt_with:
      type: openssl
      password: $BACKUP_ENCRYPTION_PASSWORD

    storages:
      s3:
        type: s3
        bucket: my-app-backups
        region: us-east-1
        path: backups
        access_key_id: $S3_ACCESS_KEY_ID
        secret_access_key: $S3_SECRET_ACCESS_KEY

    notifiers:
      webhook:
        type: webhook
        url: $BACKUP_WEBHOOK_URL
```

## Usage

### Perform backup once

```bash
gobackup perform -m app_backup -c ./gobackup.yml
```

### Run scheduler and Web UI in foreground

```bash
gobackup run --config ./gobackup.yml
```

### Start as daemon

```bash
gobackup start --config ./gobackup.yml
```

The Web UI listens on the configured `web.host` and `web.port`.

Default test config credentials are:

```text
username: gobackup
password: 123456
```

Production configs should set a strong password.

## Signals

TinyGB keeps GoBackup's signal handling:

- `HUP` - hot reload configuration.
- `QUIT` - graceful shutdown.

```bash
# Reload configuration
kill -HUP <pid>

# Exit daemon
kill -QUIT <pid>
```

## Development

Run Go tests:

```bash
go test ./...
```

Build Web UI:

```bash
cd web
pnpm install
pnpm build
```

Run locally with the test config:

```bash
make run
```

## License

MIT
