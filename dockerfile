# Stage 1 — Build
FROM --platform=linux/amd64 node:22-alpine AS builder

WORKDIR /app

# Copy only package files first for caching
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

COPY package*.json ./
RUN npm i --legacy-peer-deps

# Copy the rest of the code and build
COPY . .
RUN npm run build

# Stage 2 — Run
FROM --platform=linux/amd64 node:22-alpine AS runner

WORKDIR /app

# Set environment
ENV NODE_ENV=production
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

# Install production dependencies

# Copy standalone contents to root (note trailing / on source)
COPY --from=builder  /app/.next/standalone/ ./
# Copy static assets
COPY --from=builder  /app/.next/static ./.next/static
# Copy public assets (if any)
COPY --from=builder  /app/public ./public

# Create non-root user

EXPOSE 3000
CMD ["node", "server.js"]