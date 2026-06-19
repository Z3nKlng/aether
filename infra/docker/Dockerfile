FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN pnpm add -g turbo

FROM base AS builder
ARG APP_NAME
WORKDIR /app
COPY . .
RUN turbo prune --scope=$APP_NAME --docker

FROM base AS installer
ARG APP_NAME
WORKDIR /app

# First copy only the pruned package.json and lockfile
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Build the project
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN turbo build --filter=$APP_NAME...

FROM base AS runner
ARG APP_NAME
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app .

# Most apps use a start script, but we can override this
CMD ["sh", "-c", "pnpm --filter ${APP_NAME} start"]
