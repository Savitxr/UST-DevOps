# Users Service - Microservice

A Spring Boot microservice for managing user data, part of a microservices architecture. This service provides user management functionality and is consumed by other services like the Orders Service.

## 🎯 Overview

This service handles all user-related operations including user creation, retrieval, updates, and deletion. It serves as a central user management system for the microservices ecosystem.

## 📋 Features

- User CRUD operations
- MySQL database persistence
- RESTful API endpoints
- JPA/Hibernate ORM
- Independent deployable service

## 🛠️ Technology Stack

- **Framework**: Spring Boot 4.0.3
- **Language**: Java 17
- **Database**: MySQL (usersdb)
- **ORM**: JPA/Hibernate
- **Build Tool**: Maven

## ⚙️ Configuration

### Database Configuration
```properties
Database: usersdb
Port: 3306
Username: appuser
Password: password123
```

### Service Configuration
```properties
Server Port: 8082
Application Name: users-service
```

## 🚀 Getting Started

### Prerequisites
- Java 17 or higher
- MySQL Server
- Maven (or use included wrapper)

### Database Setup
```sql
CREATE DATABASE usersdb;
CREATE USER 'appuser'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON usersdb.* TO 'appuser'@'localhost';
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

The service will start on `http://localhost:8082`

## 📁 Project Structure

```
src/main/java/com/ust_proj/chriss_proj/
├── ChrissProjApplication.java  # Main application class
├── controller/                  # REST controllers
├── entity/                      # JPA entities
├── repository/                  # Data repositories
└── service/                     # Business logic
```

## 📡 API Endpoints

The service exposes RESTful endpoints for user management. Check the controller classes for detailed API documentation.

## 🔗 Integration

This service is consumed by:
- **Orders Service** for user validation and information retrieval

Database connection:
- **MySQL Database** at `localhost:3306`

## 🐳 Deployment

This service was deployed on AWS EC2. For production deployment:
1. Update database connection strings
2. Set appropriate environment variables
3. Build JAR: `mvn clean package`
4. Run: `java -jar target/chriss_proj-0.0.1-SNAPSHOT.jar`

## 📝 Notes

- This service should be started before dependent services (e.g., Orders Service)
- Database schema is auto-updated on startup (ddl-auto=update)
- SQL queries are logged in console (show-sql=true)
- Runs on port 8082 to avoid conflicts with other services
