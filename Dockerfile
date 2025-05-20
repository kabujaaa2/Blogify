# Use Node.js LTS as the base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the frontend
RUN npm run build

# Production image, copy all the files and run the server
FROM base AS runner
ENV NODE_ENV production

# Copy necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/src/server.js ./src/server.js
COPY --from=builder /app/src/lib ./src/lib
COPY --from=builder /app/src/middleware ./src/middleware

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 blogify
USER blogify

# Expose ports
EXPOSE 12000
EXPOSE 12001

# Start the server
CMD ["npm", "start"]