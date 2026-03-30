# User-BlogPost FastAPI Application

A FastAPI-based blog management system demonstrating bidirectional relationships between users and posts using SQLAlchemy ORM.

## 🎯 Overview

This application provides a REST API for managing users and blog posts with bidirectional relationships. Users can have multiple posts, and posts belong to users, showcasing proper ORM relationship management.

## 📋 Features

- User management (Create, Read, Update, Delete)
- Blog post management
- Bidirectional relationships (User ↔ Posts)
- SQLAlchemy ORM with relationship mapping
- Automatic API documentation (Swagger/ReDoc)
- Pydantic models for validation

## 🛠️ Technology Stack

- **Framework**: FastAPI
- **Language**: Python 3.x
- **ORM**: SQLAlchemy
- **Validation**: Pydantic
- **Database**: SQLite/PostgreSQL/MySQL (configurable)

## ⚙️ Project Structure

```
User-BlogPost-FastAPI-Bidirectional-Application/
├── main.py          # FastAPI application and endpoints
├── models.py        # SQLAlchemy ORM models
├── database.py      # Database configuration
└── README.md        # This file
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. **Create a virtual environment (recommended):**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

2. **Install dependencies:**
```bash
pip install fastapi uvicorn sqlalchemy pydantic
```

### Running the Application

```bash
uvicorn main:app --reload
```

The application will start on `http://localhost:8000`

## 📡 API Endpoints

### Users
- `POST /api/v1/users` - Create a new user
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/{user_id}` - Get a specific user with their posts

### Posts
- `POST /api/v1/users/{user_id}/posts` - Create a post for a user
- `GET /api/v1/posts` - Get all posts
- `GET /api/v1/posts/{post_id}` - Get a specific post

## 📚 API Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 💾 Database Models

### User Model
```python
- id: Integer (Primary Key)
- name: String
- posts: List[Post] (Relationship)
```

### Post Model
```python
- id: Integer (Primary Key)
- title: String
- content: String (Optional)
- user_id: Integer (Foreign Key)
- user: User (Relationship)
```

## 🔄 Bidirectional Relationships

The application demonstrates proper bidirectional relationships:
- Users have a collection of posts
- Each post references its author (user)
- Changes cascade appropriately

## 📝 Example Usage

### Create a User
```bash
curl -X POST "http://localhost:8000/api/v1/users" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe"}'
```

### Create a Post for User
```bash
curl -X POST "http://localhost:8000/api/v1/users/1/posts" \
  -H "Content-Type: application/json" \
  -d '{"title": "My First Post", "content": "Hello World!"}'
```

### Get User with Posts
```bash
curl "http://localhost:8000/api/v1/users/1"
```

## 🐳 Deployment

This application was deployed on AWS EC2. For production deployment:

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run with Gunicorn:**
   ```bash
   pip install gunicorn
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```

3. **Configure database** (for production, use PostgreSQL/MySQL instead of SQLite)

## ⚙️ Configuration

Edit `database.py` to configure your database:
```python
# For SQLite (default)
DATABASE_URL = "sqlite:///./blog.db"

# For PostgreSQL
# DATABASE_URL = "postgresql://user:password@localhost/dbname"

# For MySQL
# DATABASE_URL = "mysql+pymysql://user:password@localhost/dbname"
```

## 📝 Notes

- Database tables are created automatically on startup
- The application uses SQLAlchemy's declarative base for ORM
- Pydantic models provide automatic request/response validation
- All responses follow consistent JSON schema
