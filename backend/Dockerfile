# Stage 1 — Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install NestJS CLI globally so it's always available
RUN npm install -g @nestjs/cli

COPY package*.json ./
RUN npm ci

COPY . .
RUN nest build

# Stage 2 — Run (lean production image)
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]