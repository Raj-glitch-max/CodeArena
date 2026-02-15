# Network Policies

## Approach: Zero-Trust

All network policies are defined in `k8s/base/network-policies.yaml`. The strategy:

1. **Default deny all** — no pod can send or receive traffic
2. **Allow DNS** — all pods can resolve DNS (UDP/TCP 53)
3. **Per-service allow** — each service gets explicit ingress/egress rules

## Policy Summary

```
┌──────────────────────────────────────────────────────┐
│ DEFAULT: DENY ALL INGRESS + EGRESS                   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ALL PODS → kube-dns (53/UDP, 53/TCP)               │
│                                                      │
│  ingress-nginx → auth:3001                          │
│  ingress-nginx → battle:3002                        │
│  ingress-nginx → execution:3003                     │
│  ingress-nginx → rating:3004                        │
│  ingress-nginx → websocket:3005                     │
│                                                      │
│  auth → postgres:5432, redis:6379                   │
│  battle → postgres:5432, redis:6379,                │
│           auth:3001, execution:3003                  │
│  execution → redis:6379                              │
│  rating → postgres:5432, redis:6379                 │
│  websocket → redis:6379, auth:3001, battle:3002     │
│                                                      │
│  postgres ← auth, battle, rating (5432)             │
│  redis ← auth, battle, execution, rating, ws (6379) │
└──────────────────────────────────────────────────────┘
```

## What This Prevents

| Attack Scenario | Blocked By |
|----------------|------------|
| Execution service queries database directly | execution-service egress only allows Redis |
| External pod accesses PostgreSQL | Postgres ingress only allows auth/battle/rating pods |
| WebSocket service talks to execution | WebSocket egress only allows Redis, auth, battle |
| Compromised pod scans internal network | Default deny-all blocks all undeclared traffic |

## Debugging Network Policies

If a service can't reach a dependency:

```bash
# Check if endpoints are populated
kubectl describe svc postgres -n codearena
# Endpoints should NOT be empty

# Test connectivity from inside a pod
kubectl exec -it deploy/auth-service -n codearena -- sh
# Try: wget -qO- http://postgres:5432 (should connect)

# Check network policy is applied
kubectl get networkpolicy -n codearena
kubectl describe networkpolicy auth-service-netpol -n codearena
```

## Known Issue: DNS Egress

We initially deployed network policies without DNS egress rules. Every service got `getaddrinfo EAI_AGAIN` errors — couldn't resolve any service hostnames. The fix was adding a global DNS egress policy:

```yaml
egress:
  - to: []
    ports:
      - protocol: UDP
        port: 53
      - protocol: TCP
        port: 53
```

This allows DNS to any destination on port 53, which includes kube-dns. A stricter version would limit to `kube-system` namespace.
