# Files API

TODO:
[] refactor configs


---

A Nest.js application for managing files with PostgreSQL and DrizzleORM.

## Features

- RESTful API for managing files
- PostgreSQL database with DrizzleORM
- Pagination support
- Request throttling
- Swagger API documentation
- Pino logger
- Environment configuration validation

## Project Structure

The project follows a clean architecture approach with the following structure:

- `src/apps/api`: API-specific code (controllers, modules)
- `src/domain`: Domain entities and business logic
- `src/infra`: Infrastructure code (database, external services)
- `src/shared`: Shared utilities and common code

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd obrio-test-task
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on the `.env.example` file:

```bash
cp .env.example .env
```

4. Update the `.env` file with your PostgreSQL credentials.

5. Create the database:

```bash
createdb obrio_files
```

6. Generate and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

## Running the Application

### Development

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, you can access the Swagger API documentation at:

```
http://localhost:3000/api/docs
```

## API Endpoints

### GET /api/files

Get all files with pagination.

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10)

### GET /api/files/:id

Get a file by ID.

## Environment Variables

The application uses the following environment variables:

- `PORT`: The port on which the application will run (default: 3000)
- `NODE_ENV`: The environment in which the application is running (development, staging, production)
- `API_PREFIX`: The prefix for API routes (default: api)
- `POSTGRES_HOST`: PostgreSQL host
- `POSTGRES_PORT`: PostgreSQL port (default: 5432)
- `POSTGRES_DB`: PostgreSQL database name
- `POSTGRES_USER`: PostgreSQL username
- `POSTGRES_PASSWORD`: PostgreSQL password
- `POSTGRES_SSL`: Whether to use SSL for database connection (default: false)
- `THROTTLE_TTL`: Time-to-live for throttling in seconds (default: 60)
- `THROTTLE_LIMIT`: Maximum number of requests within TTL (default: 10)
- `LOG_LEVEL`: Logging level (debug, info, warn, error) (default: info)