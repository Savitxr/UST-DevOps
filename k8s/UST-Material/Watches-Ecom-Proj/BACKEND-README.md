# Watch Marketplace: Full Project Guide

This document is a full, beginner-friendly guide to how the project works. It explains the frontend, backend services, data layer, and how everything runs inside containers. It is designed so you can present the architecture and operations in a DevOps training class.

## Big Picture

The project is a watch marketplace with a Next.js frontend and a Node.js microservices backend. It runs with Docker Compose, so each part is isolated in its own container but connected via Docker networks.

High-level flow:

1) A user opens the site in the browser.
2) The frontend calls the API Gateway for data.
3) The API Gateway finds the correct microservice via the Registry Service.
4) Microservices read/write data in PostgreSQL and send logs to the Logging Service.
5) The Gateway returns a response to the frontend.

## Frontend: What It Is and How It Runs

- Tech: Next.js (React) application in [frontend/](frontend/).
- Runtime: A Node.js container that runs `next start`.
- Port: The container listens on 3000. Docker maps host port 80 to container port 3000.

Why this matters:

- Next.js is server-rendered by default. It needs a Node runtime container, not a static Nginx container.
- The container builds the app and serves it at runtime.

When a user loads the homepage:

1) The browser requests http://<EC2_PUBLIC_IP>.
2) Docker forwards traffic from host port 80 to the frontend container on 3000.
3) Next.js renders the page and returns HTML/JS/CSS.

## Backend: Services and Responsibilities

All backend services are in [backend/](backend/) and run as separate Node.js containers.

### API Gateway

- Location: [backend/api-gateway/](backend/api-gateway/)
- Port: 8080
- Role: Single entry point for the frontend. It routes requests to the correct microservice.
- Why it exists: The frontend only needs to know one API address, while the gateway handles service discovery and routing.

### Registry Service

- Location: [backend/registry-service/](backend/registry-service/)
- Port: 8761
- Role: Service discovery. Each microservice registers itself here.
- Why it exists: The gateway can look up where a service lives and forward requests dynamically.

### Logging Service

- Location: [backend/logging-service/](backend/logging-service/)
- Port: 9000
- Role: Central log intake for services.
- Why it exists: It collects logs in one place instead of pulling logs from every container.

### Core Domain Services

Each service owns a small part of the business domain:

- User Service (8081): authentication, profiles
- Product Service (8082): watch listings, search
- Cart Service (8083): cart items and totals
- Order Service (8084): order creation
- Review Service (8085): ratings and comments

### Database

- PostgreSQL runs in its own container.
- One database instance, multiple schemas.
- Schema setup lives in [backend/db/init.sql](backend/db/init.sql).

Why separate schemas:

- Each service owns its data boundaries.
- Still uses a single Postgres container for simplicity in training.

## How the Services Work Together

Example flow: user adds a product to cart.

1) Frontend calls `POST /api/cart/items` at the Gateway.
2) Gateway checks the Registry for the Cart Service address.
3) Gateway forwards the request to the Cart Service.
4) Cart Service writes to Postgres schema `cart`.
5) Cart Service sends a log to Logging Service.
6) Response returns through the Gateway to the frontend.

Example flow: list products.

1) Frontend calls `GET /api/products`.
2) Gateway routes to Product Service.
3) Product Service reads from Postgres schema `products`.
4) Response returns to the frontend.

## Containers, Images, and Docker Compose

Each service has its own Dockerfile and image. Docker Compose orchestrates everything.

Key compose file: [docker-compose.yml](docker-compose.yml)

What Compose does:

- Builds each image from its Dockerfile.
- Starts containers in the right order.
- Connects containers to the right networks.
- Exposes selected ports to the host.

### Networks

- `frontend-network`: frontend + API gateway
- `backend-network`: gateway + services + registry + logging + postgres

Network effects:

- Containers can resolve each other by service name (for example `registry-service`).
- External users only access the ports mapped to the host.

### Ports (Host -> Container)

- Frontend: 80 -> 3000
- API Gateway: 8080 -> 8080
- Registry Service: 8761 -> 8761
- Logging Service: 9000 -> 9000
- PostgreSQL: 5432 -> 5432
- Domain services: 8081-8085 -> 8081-8085

## Environment Variables

Create a `.env` file based on [ .env.example](.env.example) and fill in secrets.

Important variables:

- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `JWT_SECRET`

These are used by services in [docker-compose.yml](docker-compose.yml) to build the `DATABASE_URL` and auth configuration.

## How to Run on EC2

Full step-by-step runbook: [backend-docs/runbook.md](backend-docs/runbook.md)

Short version:

1) Install Docker Engine + Docker Compose plugin.
2) Copy repo to EC2.
3) Create `.env` from [ .env.example](.env.example).
4) Build and start:

```bash
docker compose up -d --build
```

Access:

- Frontend: http://<EC2_PUBLIC_IP>
- API Gateway: http://<EC2_PUBLIC_IP>:8080
- Registry: http://<EC2_PUBLIC_IP>:8761
- Logs API: http://<EC2_PUBLIC_IP>:9000

Make sure the EC2 Security Group allows inbound ports 80, 8080, 8761, 9000, 5432.

## Health Checks

- Gateway: `/health`
- Registry: `/health`
- Each service: `/health`

If a container restarts or is unhealthy, use:

```bash
docker logs <container_name>
```

## Example API Requests

Examples live in [backend-docs/api-examples.md](backend-docs/api-examples.md).

## Troubleshooting

Common fixes and symptoms are in [backend-docs/troubleshooting.md](backend-docs/troubleshooting.md).

## Deep Dive and Ops Guides

- Architecture and internals: [backend-docs/deep-dive.md](backend-docs/deep-dive.md)
- Deployment and operations: [backend-docs/ops-guide.md](backend-docs/ops-guide.md)

## Presentation Tips (DevOps Training)

If you need to explain the system in a talk:

- Start with the request flow: Browser -> Frontend -> Gateway -> Service -> Database.
- Emphasize service discovery: Registry makes routing dynamic.
- Highlight container boundaries: one service per container.
- Explain Compose as the “orchestrator” for local/EC2 environments.
- Use the health checks to show how you validate uptime.
