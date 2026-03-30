# Runbook (EC2)

## Prereqs

- Ubuntu or Amazon Linux EC2 instance
- Docker Engine and Docker Compose plugin installed
- Ports open in Security Group: 80, 8080, 8761, 9000, 5432 (adjust for your needs)

## Quick Start

1) Copy the repo to the EC2 instance.
2) (Optional) Create a `.env` file from `.env.example` and update secrets.
3) Build the frontend static export so Nginx can serve it:

```
cd frontend
pnpm install
pnpm build
pnpm export
cd ..
```

4) From the repo root:

```
docker compose up -d --build
```

## Access

- Frontend: http://<EC2_PUBLIC_IP>
- Gateway: http://<EC2_PUBLIC_IP>:8080
- Registry: http://<EC2_PUBLIC_IP>:8761
- Logs API: http://<EC2_PUBLIC_IP>:9000

## Stop

```
docker compose down
```

## Persistent Data

- PostgreSQL data stored in `postgres-data` volume

## Health Checks

- Gateway: `/health`
- Registry: `/health`
- Node services: `/health`
