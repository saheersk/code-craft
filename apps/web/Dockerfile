FROM node:22-alpine AS base

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
RUN ls -l ./out/full/packages/db/prisma

# Installer Stage
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy pruned lockfile and package.json from the builder stage
COPY --from=builder /app .


COPY --from=builder /app/packages/db/.env /app/out/full/packages/db/.env
COPY --from=builder /app/apps/web/.env /app/out/full/apps/web/.env
RUN cat /app/out/full/packages/db/.env
RUN cat /app/out/full/apps/web/.env
# Install dependencies using the pruned lockfile
RUN yarn install
# Debug step: List the files to ensure the Prisma schema exists at the expected location
RUN ls -l /app/out/full/packages/db/prisma

# COPY --from=builder /app/packages/db/prisma/prisma.schema /app/out/full/packages/db/prisma/
# COPY --from=builder /app/out/full/ .

# Run Prisma generate
RUN export $(grep -v '^#' /app/out/full/packages/db/.env | xargs) && \
    yarn prisma generate --schema=./out/full/packages/db/prisma/schema.prisma && \
    yarn prisma migrate deploy --schema=./out/full/packages/db/prisma/schema.prisma

# Copy the full workspace and build the project

RUN yarn cache clean
RUN --env-file /app/out/full/packages/db/.env yarn turbo run build
# RUN yarn turbo run build

# Runner Stage
FROM base AS runner
WORKDIR /app

# Create non-root user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy the necessary files to reduce image size
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

COPY --from=installer /app/packages/db/.env /app/out/full/packages/db/.env
COPY --from=builder /app/apps/web/.env /app/out/full/apps/web/.env
COPY --from=builder /app/apps/web/package.json /app/out/full/apps/web/package.json

# Set the entrypoint for the Next.js app
CMD yarn dev