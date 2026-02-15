# Monitoring Brutal Test

**Total:** 600 points

## Level 1: Concepts (100 pts - 10 each)

1.1 What are the 3 pillars of observability?
1.2 Metrics vs Logs vs Traces?
1.3 What is Prometheus?
1.4 What is Grafana?
1.5 What is a time series database?
1.6 Explain scraping vs pushing metrics
1.7 What is Alertmanager?
1.8 What are the 4 Golden Signals?
1.9 What is RED method?
1.10 What is distributed tracing?

## Level 2: Implementation (150 pts)

2.1 Set up Prometheus to scrape http://localhost:9100 (25 pts)
2.2 Install and configure Node Exporter (25 pts)
2.3 Add custom counter metric in Express app (25 pts)
2.4 Create Grafana dashboard for CPU and memory (25 pts)
2.5 Write alert rule for CPU > 80% for 5 minutes (25 pts)
2.6 Configure Slack notifications for alerts (25 pts)

## Level 3: Debugging (150 pts)

3.1 Prometheus shows "target down". Debug. (25 pts)
3.2 Grafana shows "no data". What to check? (25 pts)
3.3 Alert fires constantly (flapping). Fix it. (25 pts)
3.4 High cardinality causing Prometheus to crash. Explain and fix. (25 pts)
3.5 Logs filling up disk. Solution? (25 pts)
3.6 Can't find root cause of slow request. How to trace? (25 pts)

## Level 4: Production (150 pts)

4.1 Design complete monitoring for CodeArena (all services) (50 pts)
4.2 Create dashboard showing: request rate, error rate, latency percentiles (50 pts)
4.3 Set up log aggregation with retention policy (50 pts)

## Level 5: Advanced (50 pts)

5.1 Design monitoring that detects issues before users notice (50 pts)

**Scoring:** 420+ to pass
