# AFF — Team 4 Flower Fusion | 3-Tier Microservices Documentation

> **Docker Training Project** | AWS EC2 | 3-Tier Architecture | Microservices

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [3-Tier Network Architecture](#2-3-tier-network-architecture)
3. [Microservices Overview](#3-microservices-overview)
4. [Network Isolation](#4-network-isolation)
5. [Project Structure](#5-project-structure)
6. [Docker Concepts](#6-docker-concepts)
7. [docker-compose.yml Explained](#7-docker-composeyml-explained)
8. [Deployment on AWS EC2](#8-deployment-on-aws-ec2)
9. [Common Commands](#9-common-commands)
10. [Proving Network Isolation](#10-proving-network-isolation)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Project Overview

**Team 4 Flower Fusion (AFF)** is a flower marketplace demonstrating
**3-Tier Architecture** with **Microservices** using Docker containers.

| Component     | Technology         | Container           |
|---------------|--------------------|---------------------|
| Reverse Proxy | nginx 1.25         | flower-nginx        |
| Web Frontend  | Node.js + EJS      | flower-web-app      |
| Auth API      | Node.js + Express  | flower-auth-api     |
| Product API   | Node.js + Express  | flower-product-api  |
| Cart API      | Node.js + Express  | flower-cart-api     |
| Database      | MongoDB 7          | flower-mongodb      |

---

## 2. 3-Tier Network Architecture

```
                    INTERNET
                       |
                  [ EC2:80 ]
                       |
    ============================================
    |          TIER 1: FRONTEND-NET            |
    |            (Presentation Layer)          |
    |------------------------------------------|
    |  [nginx:80]  <------>  [web-app:3000]   |
    ============================================
                       |
    ============================================
    |          TIER 2: BACKEND-NET             |
    |           (Business Logic Layer)         |
    |------------------------------------------|
    |            [web-app:3000]                |
    |                  |                       |
    |    +-----------+---+-----------+         |
    |    |           |               |         |
    | [auth-api] [product-api] [cart-api]     |
    |   :3001       :3002         :3003       |
    ============================================
                       |
    ============================================
    |            TIER 3: DB-NET                |
    |              (Data Layer)                |
    |------------------------------------------|
    | [auth-api] [product-api] [cart-api]     |
    |                  |                       |
    |           [mongodb:27017]                |
    ============================================
```

---

## 3. Microservices Overview

### TIER 1: Frontend Services

| Service   | Port | Network      | Role                              |
|-----------|------|--------------|-----------------------------------|
| nginx     | 80   | frontend-net | Reverse proxy, only public port   |
| web-app   | 3000 | frontend-net + backend-net | Serves HTML views |

### TIER 2: Backend Services (Microservices)

| Service     | Port | Network             | Role                        |
|-------------|------|---------------------|-----------------------------|
| auth-api    | 3001 | backend-net + db-net | User login, signup          |
| product-api | 3002 | backend-net + db-net | Products, seller registration|
| cart-api    | 3003 | backend-net + db-net | Cart, orders, customization |

### TIER 3: Data Services

| Service  | Port  | Network | Role                          |
|----------|-------|---------|-------------------------------|
| mongodb  | 27017 | db-net  | Database (completely isolated)|

---

## 4. Network Isolation

| Container       | frontend-net | backend-net | db-net | Can reach DB? |
|-----------------|:------------:|:-----------:|:------:|:-------------:|
| nginx           | YES          | NO          | NO     | **NO**        |
| web-app         | YES          | YES         | NO     | **NO**        |
| auth-api        | NO           | YES         | YES    | YES           |
| product-api     | NO           | YES         | YES    | YES           |
| cart-api        | NO           | YES         | YES    | YES           |
| mongodb         | NO           | NO          | YES    | self          |

### Key Isolation Rules:
- **nginx** is on frontend-net ONLY — cannot reach APIs or DB
- **web-app** bridges frontend and backend — but NOT database
- **APIs** bridge backend and database — business logic layer
- **mongodb** is on db-net ONLY — completely hidden from internet

---

## 5. Project Structure

```
Flower-App-Application-master/
|
+-- docker-compose.yml      <- 6 services, 3 networks
+-- nginx/
|   +-- nginx.conf          <- Reverse proxy config
|
+-- services/
|   +-- web-app/            <- TIER 1: Frontend views
|   |   +-- Dockerfile
|   |   +-- package.json
|   |   +-- app.js
|   |   +-- views/          <- EJS templates
|   |   +-- public/         <- CSS (black & white)
|   |
|   +-- auth-api/           <- TIER 2: Auth microservice
|   |   +-- Dockerfile
|   |   +-- package.json
|   |   +-- app.js
|   |
|   +-- product-api/        <- TIER 2: Product microservice
|   |   +-- Dockerfile
|   |   +-- package.json
|   |   +-- app.js
|   |
|   +-- cart-api/           <- TIER 2: Cart microservice
|       +-- Dockerfile
|       +-- package.json
|       +-- app.js
|
+-- DOCKER.md               <- This documentation
```

---

## 6. Docker Concepts

### Microservices
Breaking a monolithic application into small, independent services that:
- Can be deployed independently
- Communicate via HTTP/REST APIs
- Have their own database access
- Scale independently

### 3-Tier Architecture

```
TIER 1 (Presentation)  -> What users see (nginx, web-app)
TIER 2 (Business)      -> What processes data (APIs)
TIER 3 (Data)          -> What stores data (MongoDB)
```

### Docker Networks
- **bridge**: Default network driver for single-host
- Services on SAME network can communicate
- Services on DIFFERENT networks are isolated
- Docker DNS resolves service names to IPs

### Private IP Communication
Containers talk via Docker's internal DNS:
```
web-app calls: http://auth-api:3001/api/auth/login
               http://product-api:3002/api/products
               http://cart-api:3003/api/cart
```
No public IPs needed. All internal.

---

## 7. docker-compose.yml Explained

### Services Startup Order
```
mongodb -> auth-api, product-api, cart-api -> web-app -> nginx
```

### Network Assignment

**frontend-net only:**
```yaml
nginx:
  networks:
    - frontend-net     # Can ONLY reach web-app
```

**frontend-net + backend-net:**
```yaml
web-app:
  networks:
    - frontend-net     # Receives from nginx
    - backend-net      # Calls API services
```

**backend-net + db-net:**
```yaml
auth-api:
  networks:
    - backend-net      # Receives from web-app
    - db-net           # Connects to MongoDB
```

**db-net only:**
```yaml
mongodb:
  networks:
    - db-net           # ONLY APIs can reach this
```

---

## 8. Deployment on AWS EC2

### Security Group — Required Ports

| Port | Protocol | Source    | Purpose              |
|------|----------|-----------|----------------------|
| 22   | TCP      | Your IP   | SSH                  |
| 80   | TCP      | 0.0.0.0/0 | nginx (only public!) |

### Step-by-step

**1. SSH into EC2**
```bash
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
```

**2. Install Docker**
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin
sudo systemctl start docker
sudo usermod -aG docker $USER
newgrp docker
```

**3. Clone project**
```bash
git clone <your-repo-url>
cd Flower-App-Application-master
```

**4. Start all services**
```bash
docker compose up -d --build
```

**5. Verify**
```bash
docker compose ps
```

Expected:
```
NAME                 STATUS
flower-nginx         running (healthy)
flower-web-app       running (healthy)
flower-auth-api      running (healthy)
flower-product-api   running (healthy)
flower-cart-api      running (healthy)
flower-mongodb       running (healthy)
```

**6. Access**
```
http://<EC2-PUBLIC-IP>/
```

---

## 9. Common Commands

| Command                              | What it does                        |
|--------------------------------------|-------------------------------------|
| `docker compose up -d --build`       | Build and start all 6 containers   |
| `docker compose down`                | Stop all containers                 |
| `docker compose logs -f web-app`     | View web-app logs                   |
| `docker compose logs -f auth-api`    | View auth-api logs                  |
| `docker network ls`                  | List Docker networks                |
| `docker network inspect aff-db-net`  | See which containers are on db-net |

---

## 10. Proving Network Isolation

Run these commands to demonstrate the isolation:

```bash
# nginx CANNOT reach mongodb (not on db-net)
docker exec flower-nginx ping -c 1 flower-mongodb
# Result: FAILS

# nginx CANNOT reach auth-api (not on backend-net)
docker exec flower-nginx ping -c 1 flower-auth-api
# Result: FAILS

# web-app CAN reach auth-api (both on backend-net)
docker exec flower-web-app ping -c 1 flower-auth-api
# Result: SUCCESS

# web-app CANNOT reach mongodb (not on db-net)
docker exec flower-web-app ping -c 1 flower-mongodb
# Result: FAILS

# auth-api CAN reach mongodb (both on db-net)
docker exec flower-auth-api ping -c 1 flower-mongodb
# Result: SUCCESS
```

### Why This Matters
- If nginx is compromised, attacker CANNOT reach database
- If web-app is compromised, attacker CANNOT access raw database
- Database is only accessible from API services
- Full defense in depth

---

## 11. Troubleshooting

### Service won't start
```bash
docker compose logs <service-name>
```

### 502 Bad Gateway
```bash
docker compose ps                  # Check if web-app is healthy
docker compose logs web-app        # Check for errors
```

### API calls failing
```bash
docker compose logs auth-api       # Check auth-api logs
docker compose logs product-api    # Check product-api logs
docker compose logs cart-api       # Check cart-api logs
```

### Rebuild after code changes
```bash
docker compose up -d --build
```

---

```
=====================================================
     AFF — Team 4 Flower Fusion
     Docker Training Project | March 2026
     
     6 Containers | 3 Networks | 3-Tier Architecture
     
     TIER 1:  nginx -> web-app       (frontend-net)
     TIER 2:  web-app -> APIs        (backend-net)
     TIER 3:  APIs -> mongodb        (db-net)
     
=====================================================
```

*Docker Training Project*
