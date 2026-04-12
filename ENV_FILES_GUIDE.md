# Environment Variables Guide

## Overview

This guide explains how environment variables flow through the Super Admin application deployment.

## File Structure

```
super-admin/
├── .env.production          # Your actual production values (NEVER commit)
├── .env.production.example  # Template file (safe to commit)
├── docker-compose.yml       # Reads from .env.production
├── Dockerfile               # Does NOT contain env values
└── ENV_FILES_GUIDE.md       # This file
```

## Variable Flow

```
┌─────────────────────┐
│  .env.production    │  ← You edit this file with your actual values
│  (NOT in git)       │
└──────────┬──────────┘
           │
           │ Variables are read by docker-compose
           ↓
┌─────────────────────┐
│ docker-compose.yml  │  ← Uses ${VARIABLE_NAME} syntax
│                     │
└──────────┬──────────┘
           │
           │ Variables are passed to container at runtime
           ↓
┌─────────────────────┐
│   Container         │  ← Application receives environment variables
│   (super-admin)     │
└─────────────────────┘
```

## Setup Instructions

### Step 1: Create Your Environment File

```bash
# Copy the example file
cp .env.production.example .env.production
```

### Step 2: Edit Your Values

Open `.env.production` and update with your actual values:

```bash
# Application Configuration
NODE_ENV=production
PORT=8000
HOSTNAME=0.0.0.0

# API Configuration
NEXT_PUBLIC_API_URL=https://your-actual-domain.com
NEXT_PUBLIC_DOMAIN=https://your-actual-domain.com
```

### Step 3: Deploy

```bash
# Build and start the container
docker-compose up -d --build

# View logs
docker-compose logs -f super-admin

# Stop the container
docker-compose down
```

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `production` |
| `PORT` | Application port | `8000` |
| `HOSTNAME` | Bind address | `0.0.0.0` |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://xsite.tech` |
| `NEXT_PUBLIC_DOMAIN` | Backend domain | `https://xsite.tech` |

### Optional Variables

Add any additional variables your application needs:

```bash
# Database (if needed)
DATABASE_URL=mongodb://user:pass@host:27017/dbname

# Authentication (if needed)
JWT_SECRET=your_secret_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://admin.yourdomain.com

# Email (if needed)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_password
```

## How docker-compose.yml Uses Variables

The `docker-compose.yml` file reads variables from `.env.production`:

```yaml
environment:
  NODE_ENV: production
  PORT: ${PORT:-8000}                          # Reads PORT from .env.production, defaults to 8000
  HOSTNAME: 0.0.0.0
  NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}  # Reads from .env.production
  NEXT_PUBLIC_DOMAIN: ${NEXT_PUBLIC_DOMAIN}    # Reads from .env.production
```

The syntax `${VARIABLE_NAME:-default}` means:
- Use the value from `.env.production` if it exists
- Otherwise, use the default value

## Dockerfile vs docker-compose.yml

### Dockerfile
- Contains NO sensitive values
- Only sets basic defaults (NODE_ENV, HOSTNAME)
- Can be safely committed to git

### docker-compose.yml
- Reads from `.env.production`
- Passes variables to container at runtime
- Can be safely committed to git (no hardcoded secrets)

### .env.production
- Contains your actual sensitive values
- NEVER committed to git (in .gitignore)
- Each environment has its own file

## Different Environments

You can create multiple environment files:

```bash
.env.development     # Local development
.env.staging         # Staging environment
.env.production      # Production environment
```

Then specify which one to use:

```bash
# Use staging environment
docker-compose --env-file .env.staging up -d

# Use production environment (default)
docker-compose up -d
```

## Verifying Variables

### Check what variables are set in the container:

```bash
# View all environment variables
docker exec super-admin env

# View specific variable
docker exec super-admin env | grep NEXT_PUBLIC_API_URL

# Check if variable is set correctly
docker exec super-admin printenv NEXT_PUBLIC_API_URL
```

## Updating Variables

### To update environment variables:

1. Edit `.env.production`
2. Restart the container:

```bash
docker-compose restart
```

Or rebuild if you changed the Dockerfile:

```bash
docker-compose up -d --build
```

## Security Best Practices

### ✅ DO:
- Keep `.env.production` in `.gitignore`
- Use different values for different environments
- Rotate secrets regularly
- Use strong, random values for secrets
- Limit access to `.env.production` file

### ❌ DON'T:
- Commit `.env.production` to git
- Share `.env.production` via email or chat
- Use the same secrets across environments
- Hardcode secrets in Dockerfile or docker-compose.yml
- Use weak or default passwords

## Troubleshooting

### Variables not loading

```bash
# Check if .env.production exists
ls -la .env.production

# Check if docker-compose can read it
docker-compose config

# Restart container
docker-compose restart
```

### Wrong values being used

```bash
# Check what docker-compose sees
docker-compose config

# Check what container has
docker exec super-admin env

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Port conflicts

If port 8000 is already in use:

1. Change PORT in `.env.production`
2. Restart: `docker-compose restart`

## Comparison with real-estate-apis

This setup follows the same pattern as your `real-estate-apis`:

| Aspect | real-estate-apis | super-admin |
|--------|------------------|-------------|
| Env file | `.env` | `.env.production` |
| Variables in compose | `${VARIABLE}` | `${VARIABLE}` |
| Dockerfile | No secrets | No secrets |
| Port | 3000 | 8000 |
| Pattern | ✅ Same | ✅ Same |

## Additional Resources

- [Docker Compose Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- See `SECURITY.md` for security best practices
- See `DEPLOYMENT.md` for deployment options

## Support

For questions about environment variables, refer to this guide or contact your DevOps team.
