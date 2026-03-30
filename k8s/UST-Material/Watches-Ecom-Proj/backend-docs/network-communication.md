# Network Communication Guide

This document explains how services communicate with each other in this project, how Docker networks enable that communication, and what traffic is exposed to the outside world.

## 1) Networks in Docker Compose

Docker Compose creates isolated virtual networks. Containers on the same network can reach each other by service name using Docker DNS.

This project uses two networks:

- `frontend-network`: frontend + API gateway
- `backend-network`: gateway + registry + logging + all domain services + postgres

Why two networks:

- The frontend is isolated from database access.
- The gateway can talk to both sides, acting as a bridge.

## 2) Service Name DNS

Inside a Docker network, service names are hostnames.

Examples:

- `registry-service` resolves to the registry container IP
- `postgres` resolves to the Postgres container IP
- `logging-service` resolves to the logging container IP

This is why environment variables use URLs like `http://registry-service:8761`.

## 3) External vs Internal Traffic

External traffic (from your browser or internet) only reaches ports mapped in [docker-compose.yml](../docker-compose.yml).

Internal traffic (container-to-container) happens over Docker networks and does not require host port exposure.

### Exposed ports (public)

- Frontend: host 80 -> container 3000
- Gateway: host 8080 -> container 8080
- Registry: host 8761 -> container 8761
- Logging: host 9000 -> container 9000
- Postgres: host 5432 -> container 5432

### Internal-only traffic

- Frontend -> Gateway (within `frontend-network`)
- Gateway -> Registry (within `backend-network`)
- Gateway -> Services (within `backend-network`)
- Services -> Postgres (within `backend-network`)
- Services -> Logging (within `backend-network`)

## 4) Communication Map (Who Talks To Whom)

Frontend:

- Talks to API Gateway only
- Does not talk directly to database or services

API Gateway:

- Talks to Registry Service to discover services
- Talks to domain services to route requests

Registry Service:

- Receives registration from all services
- Provides service locations to the Gateway

Domain Services (user, product, cart, order, review):

- Talk to Registry Service (register on startup)
- Talk to Postgres for data
- Talk to Logging Service for logs
- Do not talk directly to each other (all cross-service traffic goes via the gateway)

Logging Service:

- Receives logs from services
- Does not call other services

Postgres:

- Receives DB connections from services
- Does not call other services

## 5) Example: User Login Network Path

1) Browser -> Frontend (HTTP 80)
2) Frontend -> Gateway (HTTP 8080, internal)
3) Gateway -> Registry (HTTP 8761, internal)
4) Gateway -> User Service (HTTP 8081, internal)
5) User Service -> Postgres (TCP 5432, internal)
6) User Service -> Logging (HTTP 9000, internal)
7) Response returns back through Gateway -> Frontend -> Browser

## 6) Why the Gateway Bridges Networks

The gateway is attached to both networks. This lets it:

- Accept public requests via the frontend network
- Reach internal services via the backend network

This prevents the frontend from reaching the database or service containers directly.

## 7) Common Network Problems

- DNS resolution fails: containers are on different networks
- Connection refused: target service is not healthy yet
- Wrong port: mismatch between container port and host mapping

## 8) How to Verify Connectivity

Inside a container:

```bash
docker exec -it api-gateway sh
```

Then test DNS and HTTP:

```bash
ping registry-service
wget -qO- http://registry-service:8761/health
```

If this works, network routing is correct.
