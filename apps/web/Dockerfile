# FROM node:18-alpine AS builder

# WORKDIR /web

# COPY package*.json ./
# RUN yarn install

# COPY . ./

# RUN yarn install --frozen-lockfile

# FROM node:18-alpine

# WORKDIR /web

# COPY package*.json ./
# RUN npm install

# COPY --from=builder /frontend/.next ./.next
# COPY --from=builder /frontend/public ./public

# EXPOSE 3000

# CMD ["yarn", "dev"]
# Use Node.js base image
# FROM node:18-alpine

# # Set working directory to monorepo root
# WORKDIR /app

# # Copy package files
# COPY package.json ./

# # Install dependencies from monorepo root
# RUN yarn install --frozen-lockfile

# # Copy full monorepo
# COPY . .

# # Change to `web` directory
# WORKDIR /app/web

# # Build the `web` package
# RUN yarn build

# # Start the app
# CMD ["yarn", "start"]
# Base image for both build and install stages
FROM node:18-alpine AS base

# Builder Stage
FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /app

# Install turbo globally (ensure the version matches the one you use in your repo)
RUN yarn global add turbo@^2.3.4

# Copy the entire project into the container
COPY . .


# Generate a partial monorepo with a pruned lockfile for the "web" workspace
# Assuming "web" is the name in the package.json of your Next.js app
RUN turbo prune web --docker

# Installer Stage
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy pruned lockfile and package.json from the builder stage
COPY --from=builder /app/out/json/ .

# Install dependencies using the pruned lockfile
RUN yarn install
RUN yarn prisma generate --schema=./package/db/prisma/prisma.schema

# Copy the full workspace and build the project
COPY --from=builder /app/out/full/ .

RUN yarn cache clean
RUN yarn turbo run build

# Runner Stage
FROM base AS runner
WORKDIR /app

# Create non-root user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Set the entrypoint for the Next.js app
CMD yarn dev