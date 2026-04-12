# Security Guide - Environment Variables

## Overview

This guide explains how to securely manage environment variables for the Super Admin application across different deployment methods.

## ⚠️ IMPORTANT SECURITY RULES

1. **NEVER commit `.env.production` to version control**
2. **NEVER hardcode sensitive values in YAML files**
3. **ALWAYS use secrets management for production**
4. **ALWAYS rotate secrets regularly**
5. **ALWAYS use HTTPS in production**

## Files Overview

- `.env.production` - Your actual environment variables (NEVER commit)
- `.env.production.example` - Template file (safe to commit)
- `k8s-secrets.yml` - Kubernetes secrets template (NEVER commit with real values)
- `.gitignore` - Already configured to ignore `.env*` files

## Setup Instructions

### 1. Docker Compose Deployment

#### Step 1: Create your environment file

```bash
# Copy the example file
cp .env.production.example .env.production

# Edit with your actual values
nano .env.production
```

#### Step 2: Update `.env.production` with your values

```bash
NODE_ENV=production
PORT=8000
HOSTNAME=0.0.0.0
NEXT_PUBLIC_API_URL=https://your-actual-domain.com
NEXT_PUBLIC_DOMAIN=https://your-actual-domain.com
```

#### Step 3: Deploy

```bash
docker-compose up -d --build
```

The `docker-compose.yml` now uses `env_file` instead of hardcoded `environment` variables.

### 2. Kubernetes Deployment

#### Option A: Create secrets from command line (Recommended)

```bash
# Create namespace first
kubectl create namespace super-admin

# Create secrets from literal values
kubectl create secret generic super-admin-secrets \
  --from-literal=NODE_ENV=production \
  --from-literal=PORT=8000 \
  --from-literal=HOSTNAME=0.0.0.0 \
  --from-literal=NEXT_PUBLIC_API_URL=https://xsite.tech \
  --from-literal=NEXT_PUBLIC_DOMAIN=https://xsite.tech \
  -n super-admin

# Verify secrets were created
kubectl get secrets -n super-admin
```

#### Option B: Create secrets from .env file

```bash
# Create secrets from your .env.production file
kubectl create secret generic super-admin-secrets \
  --from-env-file=.env.production \
  -n super-admin
```

#### Option C: Use k8s-secrets.yml (Less secure)

```bash
# Edit k8s-secrets.yml with your values
nano k8s-secrets.yml

# Apply the secrets
kubectl apply -f k8s-secrets.yml

# IMPORTANT: Delete the file or remove sensitive values after applying
rm k8s-secrets.yml
```

#### Deploy the application

```bash
kubectl apply -f k8s-deployment.yml
```

### 3. Cloud Provider Secrets Management

#### AWS Secrets Manager

```bash
# Store secret in AWS Secrets Manager
aws secretsmanager create-secret \
  --name super-admin/production \
  --secret-string file://.env.production

# Reference in ECS task definition or use AWS Secrets CSI driver for EKS
```

#### Google Cloud Secret Manager

```bash
# Create secret
gcloud secrets create super-admin-env --data-file=.env.production

# Grant access to service account
gcloud secrets add-iam-policy-binding super-admin-env \
  --member="serviceAccount:your-service-account@project.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

#### Azure Key Vault

```bash
# Create Key Vault
az keyvault create --name super-admin-kv --resource-group myResourceGroup

# Add secrets
az keyvault secret set --vault-name super-admin-kv --name "NEXT-PUBLIC-API-URL" --value "https://xsite.tech"
```

## Verifying Secrets

### Docker Compose

```bash
# Check environment variables inside container (be careful in production)
docker exec super-admin env | grep NEXT_PUBLIC
```

### Kubernetes

```bash
# View secret (base64 encoded)
kubectl get secret super-admin-secrets -n super-admin -o yaml

# Decode a specific value
kubectl get secret super-admin-secrets -n super-admin -o jsonpath='{.data.NEXT_PUBLIC_API_URL}' | base64 -d

# Check environment variables in pod
kubectl exec -it deployment/super-admin -n super-admin -- env | grep NEXT_PUBLIC
```

## Updating Secrets

### Docker Compose

```bash
# Edit .env.production
nano .env.production

# Restart container to apply changes
docker-compose restart
```

### Kubernetes

```bash
# Update secret
kubectl create secret generic super-admin-secrets \
  --from-literal=NEXT_PUBLIC_API_URL=https://new-domain.com \
  --dry-run=client -o yaml | kubectl apply -f -

# Restart deployment to pick up new secrets
kubectl rollout restart deployment/super-admin -n super-admin
```

## Best Practices

### 1. Use Different Secrets for Different Environments

```
.env.development    # Local development
.env.staging        # Staging environment
.env.production     # Production environment
```

### 2. Rotate Secrets Regularly

```bash
# Generate new secrets periodically
# Update in your secrets management system
# Restart applications to pick up new values
```

### 3. Limit Access to Secrets

- Only give access to people who absolutely need it
- Use role-based access control (RBAC)
- Audit secret access regularly

### 4. Use Secret Scanning Tools

```bash
# Install git-secrets to prevent committing secrets
git secrets --install
git secrets --register-aws
```

### 5. Encrypt Secrets at Rest

- Use encrypted storage for secrets
- Enable encryption in Kubernetes
- Use cloud provider encryption services

## Troubleshooting

### Secrets not loading

```bash
# Docker Compose: Check if .env.production exists
ls -la .env.production

# Kubernetes: Check if secret exists
kubectl get secret super-admin-secrets -n super-admin

# Check pod logs
kubectl logs deployment/super-admin -n super-admin
```

### Wrong values being used

```bash
# Docker Compose: Restart container
docker-compose down && docker-compose up -d

# Kubernetes: Restart deployment
kubectl rollout restart deployment/super-admin -n super-admin
```

## Emergency Response

### If secrets are accidentally committed:

1. **Immediately rotate all exposed secrets**
2. **Remove from git history:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env.production" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. **Force push (if safe to do so):**
   ```bash
   git push origin --force --all
   ```
4. **Notify your team**
5. **Review access logs for unauthorized access**

## Additional Security Measures

### 1. Use HTTPS Only

Ensure all API calls use HTTPS in production.

### 2. Enable CORS Properly

Configure CORS to only allow requests from trusted domains.

### 3. Use Security Headers

Add security headers in your reverse proxy or Next.js config.

### 4. Regular Security Audits

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update
```

### 5. Monitor for Suspicious Activity

- Set up logging and monitoring
- Alert on unusual access patterns
- Regular security reviews

## Support

For security concerns or questions, contact your security team immediately.

**Remember: Security is everyone's responsibility!**
