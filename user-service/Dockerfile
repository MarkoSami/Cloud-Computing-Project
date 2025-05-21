FROM node:18-slim

WORKDIR /app

# Install OpenSSL and PostgreSQL client for health checks
RUN apt-get update && apt-get install -y openssl libssl-dev postgresql-client

COPY package*.json ./

RUN npm install

COPY . .

# Only generate Prisma client during build
RUN npx prisma generate

# Make entrypoint script executable
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

# Use the entrypoint script to handle migrations and startup
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["npm", "run", "start"]
