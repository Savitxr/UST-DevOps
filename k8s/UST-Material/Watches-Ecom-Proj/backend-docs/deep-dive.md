# Deep Dive: Architecture, Data Flow, and Internals

This guide expands on the project architecture for training and presentation. It explains how each part fits together, why certain choices were made, and what happens during real requests.

## 1) System Overview

The system is a microservices-based watch marketplace. It consists of:

- A Next.js frontend (server-rendered, Node runtime).
- An API Gateway (single public API entry point).
- A Registry Service (service discovery).
- Domain services (user, product, cart, order, review).
- A Logging Service (central log ingestion).
- PostgreSQL (single instance, multiple schemas).

The main goal is to decouple concerns so each service can scale or change independently while still working together.

## 2) Request Lifecycle: Step-by-Step

### Example: User logs in

1) Browser sends `POST /api/users/login` to the Gateway.
2) Gateway checks registry for `user-service` location.
3) Gateway forwards the request to User Service.
4) User Service validates credentials in Postgres `users` schema.
5) User Service logs the event to Logging Service.
6) User Service returns JWT to the Gateway.
7) Gateway returns response to frontend.

### Example: User views products

1) Browser sends `GET /api/products` to Gateway.
2) Gateway routes to Product Service.
3) Product Service queries Postgres `products` schema.
4) Product Service returns list to Gateway.
5) Gateway returns list to frontend.

Key idea: Gateway is the only public API endpoint. Services are not exposed directly to the browser.

## 3) Frontend Architecture (Next.js)

- App router is in [frontend/app/](../frontend/app/).
- UI components are in [frontend/components/](../frontend/components/).
- API calls are abstracted in [frontend/lib/api.ts](../frontend/lib/api.ts).

Why Next.js:

- Server-side rendering improves initial load.
- Routing is built-in.
- Works well with API-driven backends.

### Frontend runtime details

- The frontend container runs `pnpm start` which executes `next start`.
- It listens on port 3000 in the container.
- Docker maps host port 80 to container port 3000.

## 4) API Gateway Details

Role of the gateway:

- Routes all `/api/*` requests to services.
- Performs service discovery via registry.
- Can centralize auth, rate-limits, or validation in the future.

Why it matters:

- Frontend only needs one URL.
- Backend services can move or scale without frontend changes.

## 5) Registry Service (Service Discovery)

- Services register themselves with the registry on startup.
- The registry provides a list of service instances to the gateway.
- This allows the gateway to route dynamically without hardcoding addresses.

Concepts:

- Service registration: service announces `name` + `host` + `port`.
- Heartbeat or TTL: if a service stops reporting, it is removed.

## 6) Domain Services

Each service follows the same pattern:

- Reads config from environment variables.
- Registers with registry service.
- Connects to Postgres.
- Exposes REST endpoints and `/health`.
- Sends logs to Logging Service.

### User Service

- Handles auth and profiles.
- Generates JWT tokens based on `JWT_SECRET`.

### Product Service

- Manages watch listings.
- Supports search queries by brand/category.

### Cart Service

- Maintains cart items per user.
- Often queried just before checkout.

### Order Service

- Creates an order from cart or manual input.
- Stores orders in `orders` schema.

### Review Service

- Manages reviews and ratings.

## 7) Logging Service

Purpose:

- Centralizes logs in one container.
- Avoids checking logs on each service.

Typical log flow:

1) Service sends log payload to Logging Service.
2) Logging Service stores or prints the log.
3) Operators use logs for troubleshooting.

## 8) Database Model

- One Postgres instance.
- Multiple schemas: `users`, `products`, `cart`, `orders`, `reviews`.
- Schema is initialized by [backend/db/init.sql](../backend/db/init.sql).

Why one instance:

- Simplifies training and local dev.
- Services still have separate schemas to enforce ownership boundaries.

## 9) Docker Compose Orchestration

Compose file: [docker-compose.yml](../docker-compose.yml)

What Compose handles:

- Build images for each service.
- Start services in dependency order.
- Attach networks.
- Expose ports to the host.

### Networks

- `frontend-network`: frontend + gateway
- `backend-network`: gateway + services + registry + logging + postgres

Why networks matter:

- Container DNS resolution: service names become hostnames.
- Isolation: frontend cannot directly reach database.

## 10) Health Checks and Resilience

Each service exposes `/health` so Compose can verify readiness.

Why this is important:

- Prevents the gateway from starting before registry is ready.
- Helps detect crash loops and dependency failures.

## 11) Common Failure Modes

- Registry not healthy -> services cannot register -> gateway routes fail.
- Postgres not ready -> services fail to start.
- Wrong `DATABASE_URL` -> schema errors.
- Port mismatch -> service unreachable from host.

Use `docker logs <container>` to debug.

## 12) How to Explain in a Presentation

Suggested narrative:

1) Start with the user request journey.
2) Explain the gateway and registry as the control plane.
3) Show how services own their data.
4) Talk about container isolation and Docker networks.
5) Finish with health checks and operational best practices.
