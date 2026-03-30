# Ops Guide: Deploy, Run, Monitor, and Debug

This guide goes deeper into operational tasks for DevOps training.

## 1) Before You Deploy

Checklist:

- EC2 instance ready (Ubuntu/Amazon Linux).
- Docker Engine installed.
- Docker Compose plugin installed.
- Security Group inbound rules allow ports: 80, 8080, 8761, 9000, 5432.
- `.env` created from `.env.example`.

## 2) Build and Start

From repo root:

```bash
docker compose up -d --build
```

Verify:

```bash
docker compose ps
```

## 3) Validate Services

Health endpoints:

- Gateway: `http://<EC2_PUBLIC_IP>:8080/health`
- Registry: `http://<EC2_PUBLIC_IP>:8761/health`
- Service health: `http://<EC2_PUBLIC_IP>:8081/health` etc

Frontend:

- `http://<EC2_PUBLIC_IP>`

## 4) Logs and Debugging

Container logs:

```bash
docker logs watch-frontend
```

Follow logs:

```bash
docker logs -f api-gateway
```

Common log patterns to watch:

- Connection refused (registry not ready)
- Database authentication failures
- Port already in use

## 5) Restart and Recovery

Restart a single service:

```bash
docker restart product-service
```

Rebuild one service:

```bash
docker compose up -d --build product-service
```

## 6) Database Operations

Check Postgres health:

```bash
docker exec -it postgres pg_isready -U <user>
```

Connect to DB:

```bash
docker exec -it postgres psql -U <user> -d <db>
```

List schemas:

```sql
\dn
```

## 7) Data Reset (Training)

If you need a clean database:

```bash
docker compose down
```

Then remove the volume:

```bash
docker volume rm <compose_project>_postgres-data
```

Then start again:

```bash
docker compose up -d --build
```

## 8) Scaling Services

Compose supports scaling with:

```bash
docker compose up -d --scale product-service=2
```

Notes:

- Registry should list multiple instances.
- Gateway should load-balance across instances if implemented.

## 9) Security Best Practices (Training Focus)

- Do not expose Postgres to the public internet in production.
- Use strong values for `JWT_SECRET`.
- Keep `.env` out of source control.
- Consider HTTPS termination (load balancer or reverse proxy).

## 10) Performance Tips

- Build images on a larger machine then push to a registry.
- Use `docker system prune` to clean unused artifacts.
- Watch disk space: `df -h`.

## 11) Troubleshooting Quick Links

- See [backend-docs/troubleshooting.md](troubleshooting.md)
- See [backend-docs/api-examples.md](api-examples.md)
- See [backend-docs/runbook.md](runbook.md)
