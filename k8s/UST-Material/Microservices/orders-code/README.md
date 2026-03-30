# Orders Service - Microservice

A Spring Boot microservice for managing orders, part of a microservices architecture. This service communicates with the Users Service to provide complete order management functionality.

## 🎯 Overview

This service handles all order-related operations and integrates with the Users Service for user validation and information retrieval.

## 📋 Features

- Order CRUD operations
- Integration with Users Service
- MySQL database persistence
- RESTful API endpoints
- JPA/Hibernate ORM

## 🛠️ Technology Stack

- **Framework**: Spring Boot 4.0.3
- **Language**: Java 17
- **Database**: MySQL (ordersdb)
- **ORM**: JPA/Hibernate
- **Build Tool**: Maven

## ⚙️ Configuration

### Database Configuration
```properties
Database: ordersdb
Port: 3306
Username: appuser
Password: password123
```

### Service Configuration
```properties
Server Port: 8081
Application Name: orders-service
Users Service URL: http://localhost:8082
```

## 🚀 Getting Started

### Prerequisites
- Java 17 or higher
- MySQL Server
- Maven (or use included wrapper)

### Database Setup
```sql
CREATE DATABASE ordersdb;
CREATE USER 'appuser'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON ordersdb.* TO 'appuser'@'localhost';
FLUSH PRIVILEGES;
```

### Running the Application

**Using Maven Wrapper (Recommended):**
```bash
# Windows
mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

**Using Maven:**
```bash
mvn spring-boot:run
```

The service will start on `http://localhost:8081`

## 📁 Project Structure

```
src/main/java/com/ust_proj/chriss_proj/
├── ChrissProjApplication.java  # Main application class
├── config/                      # Configuration classes
├── controller/                  # REST controllers
├── entity/                      # JPA entities
├── repository/                  # Data repositories
└── service/                     # Business logic
```

## 📡 API Endpoints

The service exposes RESTful endpoints for order management. Check the controller classes for detailed API documentation.

## 🔗 Integration

This service connects to:
- **Users Service** at `http://localhost:8082` for user-related operations
- **MySQL Database** at `localhost:3306` for data persistence

## 🐳 Deployment

This service was deployed on AWS EC2. For production deployment:
1. Update database connection strings
2. Configure Users Service URL
3. Set appropriate environment variables
4. Build JAR: `mvn clean package`
5. Run: `java -jar target/chriss_proj-0.0.1-SNAPSHOT.jar`

## 📝 Notes

- Ensure the Users Service is running before starting this service
- Database schema is auto-updated on startup (ddl-auto=update)
- SQL queries are logged in console (show-sql=true)
