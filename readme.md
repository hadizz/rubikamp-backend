# Rubikamp Backend

A simple backend service providing user authentication, user management, and product management functionality.

## Features

- User authentication (signup and login)
- JWT-based authentication
- Admin-only routes for user management
- Product management (CRUD operations)
- API documentation with Swagger
- Error handling middleware

## Prerequisites

- Node.js (v12 or higher)
- npm
- for database we are using the JSON file-based storage

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/rubikamp-backend.git
   cd rubikamp-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=8000
   JWT_SECRET=your_jwt_secret_key
   ```

## Usage

### Development

Start the development server with hot reload:
```
npm run dev
```

Server is now running on http://localhost:8000

### API Documentation

The API documentation is available at http://localhost:8000/docs when the server is running.

### Available Endpoints

#### Authentication
- POST `/api/auth/signup` - Register a new user
- POST `/api/auth/login` - Login a user

#### Users (Admin only)
- GET `/api/users` - Get all users
- GET `/api/users/:id` - Get a specific user
- POST `/api/users` - Create a new user
- PUT `/api/users/:id` - Update a user
- DELETE `/api/users/:id` - Delete a user

#### Products
- GET `/api/products` - Get all products
- GET `/api/products/:id` - Get a specific product
- GET `/api/products/category/:category` - Get products by category
- POST `/api/products` - Create a new product (Admin only)
- PUT `/api/products/:id` - Update a product (Admin only)
- DELETE `/api/products/:id` - Delete a product (Admin only)

### Testing

You can use Postman or the Swagger UI at `/api-docs` for testing endpoints.

Have fun! :)
