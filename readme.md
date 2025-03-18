# Rubikamp Backend

A simple authentication backend service providing user registration, login, and user management functionality.

## Features

- User authentication (signup and login)
- JWT-based authentication
- Admin-only routes for user management
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

You can use Postman for testing endpoints.

Have fun! :)