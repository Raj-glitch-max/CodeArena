# Kubernetes Brutal Test

**Total:** 700 points

## Level 1: Concepts (100 pts - 10 each)

1.1 What is a Pod?
1.2 Deployment vs StatefulSet vs DaemonSet?
1.3 What is a Service? Types?
1.4 Explain kubectl
1.5 What is a namespace?
1.6 ConfigMap vs Secret?
1.7 What is kubelet?
1.8 Explain kube-proxy
1.9 What is Ingress?
1.10 What is a PersistentVolume?

## Level 2: Building (150 pts)

2.1 Create deployment with 3 replicas of Nginx (25 pts)
2.2 Expose deployment as LoadBalancer service (25 pts)
2.3 Create ConfigMap and use in deployment (25 pts)
2.4 Create Secret for database password (25 pts)
2.5 Write deployment with resource limits (CPU/memory) (25 pts)
2.6 Configure liveness and readiness probes (25 pts)

## Level 3: Operations (150 pts)

3.1 Pod status CrashLoopBackOff. Debug it. (25 pts)
3.2 Service not routing traffic. Troubleshoot. (25 pts)
3.3 Scale deployment from 3 to 10 pods. Zero downtime. (25 pts)
3.4 Update image version. Rollback if failed. (25 pts)
3.5 Pod evicted due to insufficient memory. Fix. (25 pts)
3.6 Persistent volume claim pending. Why? Fix. (25 pts)

## Level 4: Production (200 pts)

4.1 Deploy complete CodeArena to K8s (all services, DB, caching) (50 pts)
4.2 Configure Ingress for routing (/ → frontend, /api/* → backends) (50 pts)
4.3 Set up auto-scaling based on CPU (50 pts)
4.4 Implement blue-green deployment strategy (50 pts)

## Level 5: Chaos (100 pts)

5.1 Design disaster recovery: node failure, zone failure, data loss (50 pts)
5.2 Design complete K8s setup: multi-region, HA, monitoring, security (50 pts)

**Scoring:** 490+ to pass
