# Mini-InstaPay

A digital money transfer platform designed to enable users to securely send and receive money instantly. The system supports account registration, login, balance management, transaction history tracking, and basic reporting.

## Architecture

The system is built using a microservices architecture with the following components:

1. **User Service** (Port: 8000)
   - Handles user registration and authentication
   - Manages user profiles and account details
   - Provides user-related operations

2. **Transaction Service** (Port: 8001)
   - Manages money transfers between users
   - Handles balance updates
   - Maintains transaction logs

3. **Reporting Service** (Port: 8002)
   - Generates transaction reports
   - Provides analytics and insights
   - Handles data aggregation

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Container**: Docker and Docker Compose

## Prerequisites

- Docker and Docker Compose
- Node.js (v14+) and npm (for local development)

## Environment Setup

The project supports three environments:

1. **Development**
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

2. **Staging**
   ```bash
   docker-compose -f docker-compose.staging.yml up
   ```

3. **Production**
   ```bash
   docker-compose -f docker-compose.prod.yml up
   ```

# Service Monitoring

The services provide health check endpoints at /health that return status information.

## API Documentation

### User Service Endpoints
- POST /api/users/register - Register a new user
  ```json
  {
    "username": "testuser",
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- POST /api/users/login - User login
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- GET /api/users/{user_id} - Get user details
- GET /api/users/by-email/{email} - Get user details by email
- PUT /api/users/{user_id}/balance - Update user balance
  ```json
  {
    "amount": 100
  }
  ```

### Transaction Service Endpoints
- POST /api/transactions - Create a new transaction
  ```json
  {
    "sender_email": "sender@example.com",
    "receiver_email": "receiver@example.com",
    "amount": 100
  }
  ```
- GET /api/transactions/user/{user_id} - Get user's transactions

### Reporting Service Endpoints
- GET /api/reports/transactions - Get transaction reports
  - Query parameters:
    - startDate (optional): ISO format date
    - endDate (optional): ISO format date
- GET /api/reports/users/{user_id} - Get user-specific reports

## Development

1. Clone the repository
2. Set up the development environment:
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

3. Access the services:
   - User Service: http://localhost:8000
   - Transaction Service: http://localhost:8001
   - Reporting Service: http://localhost:8002

## Database Schema

### User Service
```
model User {
  id        String   @id @default(uuid())
  username  String   @unique
  email     String   @unique
  password  String
  balance   Float    @default(1000)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Transaction Service
```
model Transaction {
  id            String   @id @default(uuid())
  senderId      String
  senderEmail   String
  receiverId    String
  receiverEmail String
  amount        Float
  status        String   @default("completed")
  createdAt     DateTime @default(now())
}
```

## Initial Setup

Each service needs to have its Prisma schema migrated to the database:

```bash
# Inside each service directory
npx prisma migrate dev --name init
```

## Deployment

For production deployment, use:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Security

- JWT tokens for authentication
- Password hashing with bcrypt
- Environment-specific credentials
- HTTPS in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.