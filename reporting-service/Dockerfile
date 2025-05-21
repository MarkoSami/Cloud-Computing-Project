FROM node:18-slim

WORKDIR /app

# Install OpenSSL and PostgreSQL client for health checks
RUN apt-get update && apt-get install -y openssl libssl-dev postgresql-client

COPY package*.json ./

RUN npm install

COPY . .

# Only generate Prisma client, don't run migrations during build
RUN npx prisma generate

EXPOSE 8002

# Add entrypoint script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["npm", "run", "start"]
