# UST Material - EC2 Deployment Projects

This repository contains multiple applications that were deployed on AWS EC2 instances over the past week. Each project demonstrates different architectural patterns and technologies including Application Load Balancers, Elastic IPs, NAT Gateways, VPCs, and RDS.

##  Projects Overview

### 1. Three-Tier Web Architecture
A production-grade three-tier architecture demonstrating complete AWS deployment:
- **Web Tier** - React.js frontend with Nginx web server
- **Application Tier** - Node.js/Express API backend
- **Database Tier** - Aurora MySQL Multi-AZ RDS

Features external and internal Application Load Balancers, Auto Scaling Groups, and Multi-AZ deployment for high availability.

### 2. Microservices Architecture
Two Spring Boot microservices demonstrating service-to-service communication:
- **Orders Service** - Manages order operations (Port 8081)
- **Users Service** - Manages user operations (Port 8082)

Both services were deployed on separate EC2 instances in different target groups and connected to an internal Application Load Balancer. The internal ALB routes traffic from an Apache2-hosted frontend deployed on another instance, which is also connected to an external Application Load Balancer.

### 3. Monolithic Application (Spring Boot)
A traditional monolithic Spring Boot application showcasing a single-service architecture with MySQL database integration. The application was later migrated to use AWS RDS to demonstrate managed database concepts and high availability.

### 4. User-BlogPost FastAPI Application
A FastAPI-based blog management system with bidirectional relationships between users and posts using SQLAlchemy ORM. Hosted on Apache2 using reverse proxy configuration for production deployment.

### 5. UST Hacksession Week 1
Collection of hackathon projects and experimental code from the first week's session.

##  Technologies Used

- **Backend Frameworks**: Spring Boot 4.0.3, FastAPI, Node.js/Express
- **Frontend Frameworks**: React.js
- **Languages**: Java 17, Python, JavaScript
- **Databases**: MySQL, Aurora MySQL Multi-AZ
- **ORM**: JPA/Hibernate, SQLAlchemy
- **Web Servers**: Nginx, Apache2
- **Build Tools**: Maven, npm
- **AWS Services**: EC2, RDS, Application Load Balancer, Auto Scaling Groups, VPC, NAT Gateway, Elastic IP
- **Infrastructure**: Multi-AZ deployment, Target Groups, Security Groups 

##  Documentation

Each project directory contains its own README with specific setup instructions, API documentation, and deployment details.

##  Quick Start

Navigate to each project directory for detailed setup and running instructions:

`ash
# For Three-Tier Architecture
cd 3-Tier-Architecture/app-tier
npm install
node index.js

# For Spring Boot Microservices
cd Microservices/orders-code
./mvnw spring-boot:run

# For FastAPI Application
cd User-BlogPost-FastAPI-Bidirectional-Application
pip install -r requirements.txt
uvicorn main:app --reload
`

##  AWS Architecture Highlights

- **Multi-AZ Deployment**: High availability across multiple Availability Zones
- **Load Balancing**: External and internal Application Load Balancers for traffic distribution
- **Auto Scaling**: Dynamic scaling based on demand
- **VPC Configuration**: Custom VPC with public and private subnets
- **NAT Gateway**: Secure internet access for private subnet resources
- **RDS Integration**: Managed database services with Multi-AZ failover support

##  Notes

All projects were tested and deployed on AWS EC2 instances with production-grade configurations. Ensure you have the proper database configurations, environment variables, and AWS credentials set before running locally or deploying to AWS.
