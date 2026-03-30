# Monolithic Application - Spring Boot

A traditional monolithic Spring Boot application demonstrating a single-service architecture with all components bundled together.

## 🎯 Overview

This is a monolithic application built with Spring Boot that contains all business logic, data access, and API endpoints in a single deployable unit. It serves as a comparison to the microservices architecture.

## 📋 Features

- Complete application in a single service
- MySQL database persistence
- RESTful API endpoints
- JPA/Hibernate ORM
- MVC architecture pattern

## 🛠️ Technology Stack

- **Framework**: Spring Boot 4.0.3
- **Language**: Java 17
- **Database**: MySQL (chriss_db)
- **ORM**: JPA/Hibernate
- **Build Tool**: Maven

## ⚙️ Configuration

### Database Configuration
```properties
Database: chriss_db
Port: 3306
Username: appuser

```

### Application Configuration
```properties
Server Port: 8080
Application Name: chriss_proj
```

## 🚀 Getting Started

### Prerequisites
- Java 17 or higher
- MySQL Server
- Maven (or use included wrapper)

### Database Setup
```sql
CREATE DATABASE chriss_db;
CREATE USER 'appuser'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON chriss_db.* TO 'appuser'@'localhost';
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

The application will start on `http://localhost:8080`

## 📁 Project Structure

```
src/main/java/com/ust_proj/chriss_proj/
├── ChrissProjApplication.java  # Main application class
├── controller/                  # REST controllers
├── entity/                      # JPA entities
├── repository/                  # Data repositories
└── service/                     # Business logic

src/main/resources/
├── application.properties       # Configuration
├── static/                      # Static resources
└── templates/                   # View templates
```

## 📡 API Endpoints

The application exposes RESTful endpoints. Check the controller classes for detailed API documentation.

## 🏗️ Build

To create a production-ready JAR file:

```bash
# Clean and package
mvn clean package

# The JAR file will be created in target/ directory
# Run the JAR
java -jar target/chriss_proj-0.0.1-SNAPSHOT.jar
```

## 🐳 Deployment

This application was deployed on AWS EC2. For production deployment:

1. Update database connection strings in application.properties
2. Set appropriate environment variables
3. Build the application: `mvn clean package`
4. Deploy the JAR file: `java -jar target/chriss_proj-0.0.1-SNAPSHOT.jar`

## 📊 Advantages of Monolithic Architecture

- Simpler deployment (single unit)
- Easier development for small teams
- Less complex infrastructure
- Better performance for simple applications
- Easier testing and debugging

## 📝 Notes

- Database schema is auto-updated on startup (ddl-auto=update)
- SQL queries are logged in console (show-sql=true)
- All business logic is contained in this single application
- Consider microservices architecture for scaling needs
