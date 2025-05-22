# Mini-InstaPay Platform Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [Microservices Overview](#microservices-overview)
4. [Containerization with Docker](#containerization-with-docker)
5. [Kubernetes Deployment](#kubernetes-deployment)
6. [Monitoring and Observability](#monitoring-and-observability)
7. [Database Schema](#database-schema)
8. [API Documentation](#api-documentation)
9. [Security Considerations](#security-considerations)
10. [Development Setup](#development-setup)
11. [Deployment Procedures](#deployment-procedures)

## Introduction

Mini-InstaPay is a digital money transfer platform designed to enable users to securely send and receive money instantly. The system provides the following core functionalities:

- Account registration and authentication
- Balance management
- Money transfers between users
- Transaction history tracking
- System analytics and reporting

This documentation aims to provide a comprehensive understanding of the technical architecture, deployment procedures, and operational aspects of the platform.

## System Architecture

Mini-InstaPay is built using a microservices architecture, which provides several advantages:

- **Scalability**: Each service can scale independently based on demand
- **Resilience**: Failure in one service doesn't bring down the entire system
- **Technology Flexibility**: Services can be developed using different technologies
- **Development Velocity**: Teams can work independently on different services

### High-Level System Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   User Service  │◄────►  Transaction    │◄────►   Reporting     │
│   (Port 8000)   │     │  Service (8001) │     │  Service (8002) │
│                 │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │                       ▼                       │
         │             ┌─────────────────┐               │
         └────────────►│                 │◄──────────────┘
                       │    Database     │
                       │   (PostgreSQL)  │
                       │                 │
                       └─────────────────┘
```

## Microservices Overview

### User Service (Port: 8000)
- **Responsibilities**:
  - User registration and authentication
  - User profile management
  - Account balance maintenance
  - JWT token generation and validation
- **Technologies**:
  - Node.js with Express
  - Prisma ORM
  - JWT for authentication
  - PostgreSQL database

### Transaction Service (Port: 8001)
- **Responsibilities**:
  - Process money transfers between users
  - Maintain transaction logs
  - Validate transaction details
  - Update user balances
- **Technologies**:
  - Node.js with Express
  - Prisma ORM
  - PostgreSQL database

### Reporting Service (Port: 8002)
- **Responsibilities**:
  - Generate transaction reports
  - Provide system analytics
  - Data aggregation and visualization
- **Technologies**:
  - Node.js with Express
  - Prisma ORM
  - PostgreSQL database

## Containerization with Docker

### Docker Setup

The project uses Docker for containerization, which ensures consistent deployment environments across development, staging, and production.

#### Base Docker Compose Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: postgres
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=mini_insta_pay
    volumes:
      - postgres_data:/var/lib/postgresql/data

  user-service:
    build: ./user-service
    container_name: user-service
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://admin:password@postgres:5432/mini_insta_pay
    depends_on:
      - postgres

  transaction-service:
    build: ./transaction-service
    container_name: transaction-service
    ports:
      - "8001:8001"
    environment:
      - DATABASE_URL=postgresql://admin:password@postgres:5432/mini_insta_pay
    depends_on:
      - postgres

  reporting-service:
    build: ./reporting-service
    container_name: reporting-service
    ports:
      - "8002:8002"
    environment:
      - DATABASE_URL=postgresql://admin:password@postgres:5432/mini_insta_pay
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### Environment-Specific Configurations

The system supports three environment configurations:

1. **Development Environment** (docker-compose.dev.yml)
   - Enhanced debugging
   - Volume mounts for hot reloading
   - Development-specific configurations

2. **Staging Environment** (docker-compose.staging.yml)
   - Test environment that mirrors production
   - Test data and configurations

3. **Production Environment** (docker-compose.prod.yml)
   - Optimized for performance and security
   - Production-ready configurations
   - Enhanced security features

### Service Dockerfiles

Each service uses a similar Docker configuration:

```dockerfile
# Example from user-service/Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate

EXPOSE 8000
CMD ["npm", "start"]
```

## Kubernetes Deployment

The system can be deployed to Kubernetes for production environments, providing enhanced scalability, resilience, and management capabilities.

### Kubernetes Components

1. **Deployments**
   - Define the desired state for each service
   - Manage pod lifecycle and replication

2. **Services**
   - Expose deployments as network services
   - Enable service discovery and load balancing

3. **ConfigMaps & Secrets**
   - Store configuration data and sensitive information

### Service Deployment Example

```yaml
# user-service-deployment.yaml
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  selector:
    app: user-service
  ports:
    - protocol: TCP
      port: 8000
      targetPort: 8000
  type: LoadBalancer

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
spec:
  replicas: 1
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
        - name: user-service
          image: user-service:latest
          imagePullPolicy: Never
          ports:
            - containerPort: 8000
          env:
            - name: MONGO_URL
              value: mongodb://mongo:27017
```

### Kubernetes Deployment Procedure

1. Build Docker images for each service
   ```bash
   docker build -t user-service:latest ./user-service
   docker build -t transaction-service:latest ./transaction-service
   docker build -t reporting-service:latest ./reporting-service
   ```

2. Apply Kubernetes manifests
   ```bash
   kubectl apply -f k8s/
   ```

3. Verify deployments
   ```bash
   kubectl get deployments
   kubectl get services
   kubectl get pods
   ```

## Monitoring and Observability

### Prometheus

The system uses Prometheus for metrics collection and monitoring:

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'user-service'
    static_configs:
      - targets: ['user-service:8000']

  - job_name: 'transaction-service'
    static_configs:
      - targets: ['transaction-service:8001']

  - job_name: 'reporting-service'
    static_configs:
      - targets: ['reporting-service:8002']

  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090'] 
```

### Grafana

Grafana is deployed for visualization of metrics and creation of dashboards:

```yaml
# grafana-deployment.yaml (simplified)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: grafana
spec:
  replicas: 1
  selector:
    matchLabels:
      app: grafana
  template:
    metadata:
      labels:
        app: grafana
    spec:
      containers:
        - name: grafana
          image: grafana/grafana:latest
          ports:
            - containerPort: 3000
```

### ELK Stack

The system utilizes the ELK (Elasticsearch, Logstash, Kibana) stack for centralized logging:

- **Elasticsearch**: Stores and indexes logs
- **Logstash**: Processes and transforms logs
- **Kibana**: Visualizes and analyzes logs

## Database Schema

### User Service Schema

```prisma
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

### Transaction Service Schema

```prisma
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

## API Documentation

### User Service Endpoints

- **POST /api/users/register** - Register a new user
  ```json
  {
    "username": "testuser",
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- **POST /api/users/login** - User login
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- **GET /api/users/{user_id}** - Get user details
- **GET /api/users/by-email/{email}** - Get user details by email
- **PUT /api/users/{user_id}/balance** - Update user balance
  ```json
  {
    "amount": 100
  }
  ```

### Transaction Service Endpoints

- **POST /api/transactions** - Create a new transaction
  ```json
  {
    "sender_email": "sender@example.com",
    "receiver_email": "receiver@example.com",
    "amount": 100
  }
  ```

- **GET /api/transactions/user/{user_id}** - Get user's transactions

### Reporting Service Endpoints

- **GET /api/reports/transactions** - Get transaction reports
  - Query parameters:
    - startDate (optional): ISO format date
    - endDate (optional): ISO format date
- **GET /api/reports/users/{user_id}** - Get user-specific reports

## Security Considerations

The platform implements several security measures:

1. **Authentication**
   - JWT (JSON Web Tokens) for secure authentication
   - Token expiration and refresh mechanics

2. **Data Protection**
   - Password hashing with bcrypt
   - HTTPS in production environment
   - Input validation and sanitization

3. **Environment-Specific Security**
   - Production environment uses enhanced security configurations
   - Sensitive data managed through environment variables

4. **API Security**
   - Rate limiting to prevent abuse
   - Input validation to prevent injection attacks
   - CORS configuration to prevent unauthorized access

## Development Setup

### Prerequisites
- Docker and Docker Compose
- Node.js (v14+) and npm (for local development)
- kubectl (for Kubernetes deployment)

### Local Development Setup

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd mini-insta-pay
   ```

2. Start the development environment
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

3. Access the services:
   - User Service: http://localhost:8000
   - Transaction Service: http://localhost:8001
   - Reporting Service: http://localhost:8002

### Database Migration

Each service needs to have its Prisma schema migrated to the database:

```bash
# Inside each service directory
npx prisma migrate dev --name init
```

## Deployment Procedures

### Staging Deployment

1. Build and deploy to staging environment
   ```bash
   docker-compose -f docker-compose.staging.yml up -d
   ```

2. Verify service health
   ```bash
   curl http://localhost:8000/health
   curl http://localhost:8001/health
   curl http://localhost:8002/health
   ```

### Production Deployment

#### With Docker Compose
```bash
docker-compose -f docker-compose.prod.yml up -d
```

#### With Kubernetes
1. Apply Kubernetes configurations
   ```bash
   kubectl apply -f k8s/
   ```

2. Verify deployments
   ```bash
   kubectl get pods
   kubectl get services
   ```

3. Access the services through their exposed LoadBalancer IPs
   ```bash
   kubectl get services
   ```

### Rollback Procedure

In case of deployment issues:

1. Identify the failing service
2. Roll back to the previous version
   ```bash
   kubectl rollout undo deployment/<service-name>
   ```

3. Verify service health
   ```bash
   kubectl get pods
   ``` 