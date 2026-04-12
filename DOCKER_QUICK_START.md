# Docker Quick Start Guide

## Prerequisites

- Docker installed
- Docker Compose installed

## Quick Deploy (3 Steps)

### 1. Create Environment File

```bash
cp .env.production.example .env.production
```

### 2. Edit Your Values

```bash
nano .env.production
```

Update these values:
```bash
PORT=8000
NEXT_PUBLIC_API_URL=https://xsite.tech
NEXT_PUBLIC_DOMAIN=https://xsite.tech
```

### 3. Deploy

```bash
docker-compose up -d --build
```

## Access Application

- Local: http://localhost:8000
- Production: http://your-server-ip:8000

## Common Commands

```bash
# View logs
docker-compose logs -f super-admin

# Restart
docker-compose restart

# Stop
docker-compose down

# Rebuild
docker-compose up -d --build

# Check status
docker-compose ps
```

## Build and Push to Registry

```bash
# Build
docker buildx build --platform linux/amd64 -t exponentor/super-admin:latest .

# Login to Docker Hub
docker login

# Push
docker push exponentor/super-admin:latest
```

## Environment Variables

All variables are in `.env.production` file:

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 8000 | Application port |
| NEXT_PUBLIC_API_URL | - | Backend API URL |
| NEXT_PUBLIC_DOMAIN | - | Backend domain |

## Troubleshooting

### Container won't start
```bash
docker-compose logs super-admin
```

### Port already in use
Change PORT in `.env.production` and restart

### Variables not working
```bash
docker exec super-admin env | grep NEXT_PUBLIC
docker-compose restart
```

## File Structure

```
super-admin/
├── .env.production          # Your values (NOT in git)
├── .env.production.example  # Template (in git)
├── docker-compose.yml       # Compose config
├── Dockerfile               # Build instructions
└── DOCKER_QUICK_START.md    # This file
```

## Security

- ✅ `.env.production` is in `.gitignore`
- ✅ No secrets in Dockerfile
- ✅ No secrets in docker-compose.yml
- ✅ Variables passed at runtime

## More Information

- Full guide: `ENV_FILES_GUIDE.md`
- Security: `SECURITY.md`
- Deployment options: `DEPLOYMENT.md`

## Support

For issues, check the logs:
```bash
docker-compose logs -f super-admin
```
