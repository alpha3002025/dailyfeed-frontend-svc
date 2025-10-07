# Multi-stage build for Next.js application
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install all dependencies (including devDependencies for build)
COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force

COPY . .

# Set environment variables for build
# NEXT_PUBLIC_ variables must be set at build time
ARG NEXT_PUBLIC_MEMBER_SERVICE_URL
ARG NEXT_PUBLIC_CONTENT_SERVICE_URL
ARG NEXT_PUBLIC_TIMELINE_SERVICE_URL
ARG NEXT_PUBLIC_ACTIVITY_SERVICE_URL
ARG NEXT_PUBLIC_IMAGE_SERVICE_URL
ARG NEXT_PUBLIC_SEARCH_SERVICE_URL

ENV NEXT_PUBLIC_MEMBER_SERVICE_URL=${NEXT_PUBLIC_MEMBER_SERVICE_URL}
ENV NEXT_PUBLIC_CONTENT_SERVICE_URL=${NEXT_PUBLIC_CONTENT_SERVICE_URL}
ENV NEXT_PUBLIC_TIMELINE_SERVICE_URL=${NEXT_PUBLIC_TIMELINE_SERVICE_URL}
ENV NEXT_PUBLIC_ACTIVITY_SERVICE_URL=${NEXT_PUBLIC_ACTIVITY_SERVICE_URL}
ENV NEXT_PUBLIC_IMAGE_SERVICE_URL=${NEXT_PUBLIC_IMAGE_SERVICE_URL}
ENV NEXT_PUBLIC_SEARCH_SERVICE_URL=${NEXT_PUBLIC_SEARCH_SERVICE_URL}

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]
