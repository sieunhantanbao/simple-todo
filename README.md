# Sample Todo Application

A sample full-stack Todo application built with Node.js, Express, PostgreSQL, and EJS templates. The application provides both a web interface and a RESTful API with Swagger documentation.

## Features

- Create, read, update, and delete todo items
- Web interface with Bootstrap styling
- RESTful API with Swagger documentation
- PostgreSQL database backend
- Docker and Docker Compose support
- AWS ECS deployment ready

## Prerequisites

- Node.js 20 or higher
- PostgreSQL 15
- Docker and Docker Compose (optional)

## Getting Started

### Local Development

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Copy the sample environment file and configure your database:
```bash
cp sample.env .env
```

4. Configure the database connection in `.env` file:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=tododb
```

5. Start the application:
```bash
npm start
```

The application will be available at http://localhost:3000

### Using Docker Compose

1. Build and start the containers:
```bash
docker-compose up -d
```

This will start both the PostgreSQL database and the application. The app will be available at http://localhost:3000

## API Documentation

The API documentation is available at `/api-docs` endpoint when the application is running. It provides a Swagger UI interface for testing the API endpoints.

Available endpoints:
- GET `/api/todos` - List all todos
- GET `/api/todos/:id` - Get a specific todo
- POST `/api/todos` - Create a new todo

## Project Structure

- `/models` - Database models and business logic
- `/routes` - Express route handlers
- `/views` - EJS templates for the web interface
- `app.js` - Application entry point
- `db.js` - Database connection and initialization
- `swagger.js` - Swagger/OpenAPI configuration

## Deployment

### AWS ECS Deployment

The application includes configuration for deployment to AWS ECS with Fargate:

- Task definition is provided in `sd2411-todo-td-revision.json`
- The application is containerized using the provided Dockerfile
- Load testing script available in `load-test.js`

## Load Testing

A load testing script is included to test the application's performance:

```bash
node load-test.js
```

The script simulates concurrent requests to test the application under load.

## Environment Variables

- `PORT` - Application port (default: 3000)
- `DATABASE_URL` - PostgreSQL connection string
- Additional database configuration options available in `sample.env`

