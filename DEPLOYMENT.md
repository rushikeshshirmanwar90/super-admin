# Super Admin Deployment Guide

## Prerequisites

- Docker installed
- Docker Compose installed (for local/VM deployment)
- Kubernetes cluster (for K8s deployment)
- kubectl configured (for K8s deployment)

## Option 1: Docker Compose Deployment (Recommended for VPS/VM)

### 1. Build and Run with Docker Compose

```bash
# Build and start the container
docker-compose up -d --build

# View logs
docker-compose logs -f super-admin

# Stop the container
docker-compose down

# Restart the container
docker-compose restart
```

### 2. Update Environment Variables

Edit `docker-compose.yml` and update the environment variables:

```yaml
environment:
  - NEXT_PUBLIC_API_URL=https://your-api-domain.com
  - NEXT_PUBLIC_DOMAIN=https://your-api-domain.com
```

### 3. Access the Application

Open your browser and navigate to:
- Local: `http://localhost:3000`
- Production: `http://your-server-ip:3000`

## Option 2: Docker Build and Push to Registry

### 1. Build the Docker Image

```bash
# Build for AMD64 (most cloud providers)
docker buildx build --platform linux/amd64 -t exponentor/super-admin:latest .

# Build for ARM64 (Apple Silicon, some cloud providers)
docker buildx build --platform linux/arm64 -t exponentor/super-admin:latest .

# Build for multiple platforms
docker buildx build --platform linux/amd64,linux/arm64 -t exponentor/super-admin:latest .
```

### 2. Push to Docker Hub

```bash
# Login to Docker Hub
docker login

# Push the image
docker push exponentor/super-admin:latest

# Tag with version
docker tag exponentor/super-admin:latest exponentor/super-admin:v1.0.0
docker push exponentor/super-admin:v1.0.0
```

### 3. Run the Container

```bash
docker run -d \
  --name super-admin \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://xsite.tech \
  -e NEXT_PUBLIC_DOMAIN=https://xsite.tech \
  --restart unless-stopped \
  exponentor/super-admin:latest
```

## Option 3: Kubernetes Deployment

### 1. Update Configuration

Edit `k8s-deployment.yml` and update:
- Domain name in Ingress (change `admin.xsite.tech` to your domain)
- Environment variables in ConfigMap
- Resource limits based on your needs

### 2. Deploy to Kubernetes

```bash
# Apply the deployment
kubectl apply -f k8s-deployment.yml

# Check deployment status
kubectl get pods -n super-admin
kubectl get services -n super-admin
kubectl get ingress -n super-admin

# View logs
kubectl logs -f deployment/super-admin -n super-admin

# Scale the deployment
kubectl scale deployment super-admin --replicas=3 -n super-admin
```

### 3. Update the Deployment

```bash
# Update the image
kubectl set image deployment/super-admin super-admin=exponentor/super-admin:v1.0.1 -n super-admin

# Rollback if needed
kubectl rollout undo deployment/super-admin -n super-admin

# Check rollout status
kubectl rollout status deployment/super-admin -n super-admin
```

## Option 4: Cloud Platform Deployment

### AWS ECS

1. Push image to Amazon ECR
2. Create ECS Task Definition
3. Create ECS Service
4. Configure Application Load Balancer

### Google Cloud Run

```bash
# Build and deploy
gcloud run deploy super-admin \
  --image exponentor/super-admin:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_API_URL=https://xsite.tech,NEXT_PUBLIC_DOMAIN=https://xsite.tech
```

### Azure Container Instances

```bash
az container create \
  --resource-group myResourceGroup \
  --name super-admin \
  --image exponentor/super-admin:latest \
  --dns-name-label super-admin \
  --ports 3000 \
  --environment-variables \
    NEXT_PUBLIC_API_URL=https://xsite.tech \
    NEXT_PUBLIC_DOMAIN=https://xsite.tech
```

### DigitalOcean App Platform

1. Connect your GitHub repository
2. Select the Dockerfile
3. Set environment variables
4. Deploy

## Environment Variables

Required environment variables:

```bash
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
NEXT_PUBLIC_API_URL=https://xsite.tech
NEXT_PUBLIC_DOMAIN=https://xsite.tech
```

## Nginx Reverse Proxy (Optional)

If you want to use Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name admin.xsite.tech;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## SSL/TLS Configuration

### Using Certbot (Let's Encrypt)

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d admin.xsite.tech

# Auto-renewal
sudo certbot renew --dry-run
```

## Monitoring and Logs

### View Docker Logs

```bash
# Follow logs
docker logs -f super-admin

# Last 100 lines
docker logs --tail 100 super-admin

# With timestamps
docker logs -t super-admin
```

### Health Check

```bash
# Check if container is healthy
docker ps

# Manual health check
curl http://localhost:3000
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs super-admin

# Inspect container
docker inspect super-admin

# Check if port is already in use
sudo lsof -i :3000
```

### Build fails

```bash
# Clean Docker cache
docker builder prune -a

# Rebuild without cache
docker build --no-cache -t exponentor/super-admin:latest .
```

### Environment variables not working

```bash
# Check environment variables inside container
docker exec super-admin env

# Restart container after changing env vars
docker-compose restart
```

## Performance Optimization

### 1. Enable Compression

Already configured in Next.js by default.

### 2. CDN Integration

Configure your CDN to cache static assets from `/_next/static/`

### 3. Database Connection Pooling

If using a database, configure connection pooling in your API.

### 4. Horizontal Scaling

For Kubernetes:
```bash
kubectl scale deployment super-admin --replicas=5 -n super-admin
```

For Docker Compose:
```bash
docker-compose up -d --scale super-admin=3
```

## Security Best Practices

1. Always use HTTPS in production
2. Keep Docker images updated
3. Use secrets management for sensitive data
4. Enable firewall rules
5. Regular security audits
6. Use non-root user (already configured in Dockerfile)

## Backup and Recovery

### Backup Docker Volume

```bash
docker run --rm --volumes-from super-admin -v $(pwd):/backup ubuntu tar cvf /backup/backup.tar /app
```

### Restore Docker Volume

```bash
docker run --rm --volumes-from super-admin -v $(pwd):/backup ubuntu bash -c "cd /app && tar xvf /backup/backup.tar --strip 1"
```

## Support

For issues or questions, contact your development team or refer to the Next.js documentation.
