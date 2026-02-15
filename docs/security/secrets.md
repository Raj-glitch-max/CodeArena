# Secrets Management

## Current State

Secrets are stored as Kubernetes `Secret` objects with `stringData` (base64 at rest). This is NOT production-grade — anyone with namespace read access can decode them.

### Secrets in use:

| Secret | Namespace | Contains | Used By |
|--------|-----------|----------|---------|
| `auth-secret` | codearena | `JWT_SECRET` | auth-service |
| `postgres-secret` | codearena | `POSTGRES_PASSWORD` | PostgreSQL StatefulSet |

## What To Do in Production

### Option 1: Sealed Secrets (recommended for Minikube/simple clusters)

```bash
# Install controller
helm repo add sealed-secrets https://bitnami-labs.github.io/sealed-secrets
helm install sealed-secrets sealed-secrets/sealed-secrets -n kube-system

# Install client
brew install kubeseal  # or download from GitHub releases

# Seal a secret
kubectl create secret generic auth-secret \
  --from-literal=JWT_SECRET='production-secret-key' \
  --dry-run=client -o yaml | kubeseal --cert pub-cert.pem -o yaml > sealed-auth-secret.yaml

# Apply sealed version (safe to commit to Git)
kubectl apply -f sealed-auth-secret.yaml
```

### Option 2: AWS Secrets Manager + External Secrets Operator (for EKS)

```bash
# Install ESO
helm install external-secrets external-secrets/external-secrets -n external-secrets --create-namespace

# Create SecretStore pointing to AWS Secrets Manager
# Create ExternalSecret that syncs to a K8s Secret
```

## Mistakes We Made

1. **Initially hardcoded `JWT_SECRET` in source code** — moved to env vars, then to K8s Secrets
2. **Used identical passwords across environments** — dev and prod had the same `postgres123`. Now dev uses simple passwords, production uses randomly generated ones in Secrets Manager.
3. **Committed `.env` with real passwords to Git** — added `.env` to `.gitignore` and rotated all credentials

## Security Checklist

- [ ] No secrets in source code or Dockerfiles
- [ ] No secrets in ConfigMaps (use Secret objects)
- [ ] Sealed Secrets or External Secrets Operator in production
- [ ] Rotate JWT_SECRET periodically
- [ ] Different credentials per environment
- [ ] RBAC limits who can read Secrets
