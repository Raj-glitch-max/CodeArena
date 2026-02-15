# RBAC

## Roles

Two roles defined in `k8s/security/rbac.yaml`:

### developer (read-only)
```yaml
rules:
  - apiGroups: ["", "apps", "batch"]
    resources: ["pods", "deployments", "services", "jobs", "configmaps"]
    verbs: ["get", "list", "watch"]
  - apiGroups: [""]
    resources: ["pods/log"]
    verbs: ["get", "list"]
```
For team members who need to view pod status and logs but shouldn't modify anything.

### devops (full access)
```yaml
rules:
  - apiGroups: ["*"]
    resources: ["*"]
    verbs: ["*"]
```
Full namespace admin. Bound to the `ci-cd-pipeline` ServiceAccount for automated deployments.

## ServiceAccounts

| SA | Namespace | Role | Purpose |
|----|-----------|------|---------|
| `ci-cd-pipeline` | codearena | devops | CI/CD pipeline deployments |
| `jenkins` | jenkins | jenkins-admin (ClusterRole) | Jenkins agent pod provisioning |

## Jenkins RBAC

Jenkins needs two levels of access:

1. **ClusterRole** (`jenkins-admin`): Create/delete pods in `jenkins` namespace for agent provisioning
2. **Role** (`jenkins-deployer`): Manage deployments in `codearena` namespace for kubectl deploy stage

Defined in `k8s/jenkins/rbac-jenkins-deploy.yaml`.

## Adding a New User

```bash
# Create a kubeconfig for a developer
kubectl create serviceaccount dev-user -n codearena
kubectl create rolebinding dev-user-binding \
  --role=developer \
  --serviceaccount=codearena:dev-user \
  -n codearena
```
