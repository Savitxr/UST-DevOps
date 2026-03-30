# Microservices Architecture

A microservices-based application built with Spring Boot, featuring separate services for Orders and Users management with a distributed deployment architecture on AWS.

## 🎯 Overview

This project demonstrates a microservices architecture pattern with two independently deployable services that communicate with each other. The architecture is deployed on AWS using EC2 instances, Application Load Balancers, and Apache2 for the frontend.

## 🏗️ Architecture Components

### Services

1. **Orders Service** (`orders-code/`)
   - Manages order operations (CRUD)
   - Port: 8081
   - Database: ordersdb (MySQL)
   - Communicates with Users Service
   - [View Orders Service README](orders-code/README.md)

2. **Users Service** (`users-code/`)
   - Manages user operations (CRUD)
   - Port: 8082
   - Database: usersdb (MySQL)
   - Standalone service consumed by Orders Service
   - [View Users Service README](users-code/README.md)

### Technology Stack

- **Framework**: Spring Boot 4.0.3
- **Language**: Java 17
- **Database**: MySQL
- **ORM**: JPA/Hibernate
- **Build Tool**: Maven

## ☁️ AWS Deployment Architecture

### Infrastructure Overview

```
External ALB
    ↓
Apache2 Frontend (EC2)
    ↓
Internal ALB
    ↓
    ├─→ Orders Service (EC2 - Target Group 1)
    └─→ Users Service (EC2 - Target Group 2)
```

### Deployment Details

1. **Backend Services**
   - Both Orders and Users services are deployed on **separate EC2 instances**
   - Each service is assigned to a **different target group**
   - Both target groups are registered with an **internal Application Load Balancer**
   
2. **Frontend Layer**
   - Apache2 web server hosts the frontend application
   - Deployed on a **separate EC2 instance**
   - Connected to an **external Application Load Balancer** for public access
   
3. **Traffic Flow**
   - External traffic → External ALB → Apache2 Frontend
   - Frontend API calls → Internal ALB → Backend Services
   - Inter-service communication → Direct service-to-service or via Internal ALB

### Benefits of This Architecture

- **Scalability**: Each service can scale independently
- **High Availability**: ALB distributes traffic across healthy instances
- **Security**: Internal ALB isolates backend services from direct internet access
- **Fault Tolerance**: Service failures don't cascade to other services
- **Load Distribution**: ALB ensures even distribution of requests

## 🚀 Local Development

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL Server
- Git

### Database Setup

Create the required databases:

```sql
CREATE DATABASE ordersdb;
CREATE DATABASE usersdb;

CREATE USER 'appuser'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON ordersdb.* TO 'appuser'@'localhost';
GRANT ALL PRIVILEGES ON usersdb.* TO 'appuser'@'localhost';
FLUSH PRIVILEGES;
```

### Running Services Locally

1. **Start Users Service first** (since Orders depends on it):
   ```bash
   cd users-code
   ./mvnw spring-boot:run
   ```
   Service will start on `http://localhost:8082`

2. **Start Orders Service**:
   ```bash
   cd orders-code
   ./mvnw spring-boot:run
   ```
   Service will start on `http://localhost:8081`

### Building for Production

Build JAR files for deployment:

```bash
# Build Users Service
cd users-code
./mvnw clean package

# Build Orders Service
cd orders-code
./mvnw clean package
```

JAR files will be available in `target/` directories.

## 📡 API Endpoints

### Orders Service (8081)
- `GET /orders` - List all orders
- `GET /orders/{id}` - Get order by ID
- `POST /orders` - Create new order
- `PUT /orders/{id}` - Update order
- `DELETE /orders/{id}` - Delete order

### Users Service (8082)
- `GET /users` - List all users
- `GET /users/{id}` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

## 🔧 Configuration

### Service Communication

Orders Service is configured to communicate with Users Service:
```properties
users.service.url=http://localhost:8082
```

For AWS deployment, update this to the internal ALB endpoint or direct EC2 instance IP.

### Database Configuration

Each service has its own database configuration in `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/{database_name}
spring.datasource.username=appuser
spring.datasource.password=password123
```

Update connection strings for AWS RDS or EC2-hosted MySQL instances.

## 📦 Deployment on AWS EC2

### Steps for Each Service

1. **Launch EC2 Instances**
   - Launch separate instances for Orders and Users services
   - Ensure Java 17 is installed
   - Configure security groups (ports 8081, 8082)

2. **Deploy JAR Files**
   ```bash
   # Upload JAR to EC2
   scp target/service.jar ec2-user@<instance-ip>:/home/ec2-user/
   
   # SSH into instance and run
   ssh ec2-user@<instance-ip>
   java -jar service.jar
   ```

3. **Configure Target Groups**
   - Create target groups for each service
   - Register EC2 instances with respective target groups
   - Configure health checks

4. **Setup Internal ALB**
   - Create internal Application Load Balancer
   - Add listener rules for routing
   - Configure target groups

5. **Setup Apache2 Frontend**
   - Launch EC2 instance for frontend
   - Install and configure Apache2
   - Deploy frontend application
   - Configure reverse proxy to internal ALB

6. **Setup External ALB**
   - Create external Application Load Balancer
   - Point to Apache2 frontend instance
   - Configure security groups and listeners

## 🔐 Security Considerations

- Internal ALB is not accessible from the internet
- Backend services only accept traffic from the internal ALB
- Use security groups to restrict access
- Consider using AWS VPC for network isolation
- Implement authentication/authorization in production

## 📊 Monitoring & Logging

- Configure CloudWatch for EC2 instances
- Enable ALB access logs
- Implement application-level logging
- Set up health check endpoints

## 🤝 Service Dependencies

Orders Service → Users Service (for user validation)

Ensure Users Service is running before starting Orders Service.

## 📝 Notes

- Each service can be deployed and scaled independently
- Services communicate via REST APIs
- Database per service pattern ensures loose coupling
- Load balancers provide high availability and scalability

## 📄 License

This project is for educational and training purposes.

---

For detailed information about each service, refer to their individual README files:
- [Orders Service Documentation](orders-code/README.md)
- [Users Service Documentation](users-code/README.md)
