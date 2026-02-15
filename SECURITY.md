# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | ✅ Active |

## Reporting a Vulnerability

If you discover a security vulnerability in CodeArena, please report it responsibly.

### Do

- Email **raj@codearena.dev** with a detailed description
- Include steps to reproduce the vulnerability
- Allow reasonable time for a fix before public disclosure (90 days)

### Don't

- Open a public GitHub issue for security vulnerabilities
- Exploit the vulnerability beyond what is necessary to demonstrate it
- Access or modify other users' data

## Security Measures

### Application Security
- JWT authentication with bcrypt password hashing
- CORS origin validation on all backend services
- Input validation via Zod schemas
- Rate limiting on authentication endpoints

### Infrastructure Security
- Kubernetes NetworkPolicies (zero-trust, default deny-all)
- RBAC with least-privilege roles
- Secrets stored in Kubernetes Secret objects (Sealed Secrets in production)
- Non-root container execution (UID 1001)
- Read-only filesystem where possible
- Docker socket mounted read-only for execution service

### Code Execution Sandbox
- 10-second timeout on all user-submitted code
- 256MB memory limit
- Isolated container execution
- No network access from sandboxed code
- No filesystem persistence between executions

## Responsible Disclosure

We commit to:
- Acknowledging your report within 48 hours
- Providing a timeline for fix within 7 days
- Crediting you in the changelog (unless you prefer anonymity)
