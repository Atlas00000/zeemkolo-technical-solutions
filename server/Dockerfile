# Zeemkolo API — production image for Railway (root directory: server/)
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY package.json ./
RUN pnpm install --frozen-lockfile=false

FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate && pnpm exec tsc -p tsconfig.json

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate \
  && addgroup -S zeemkolo && adduser -S zeemkolo -G zeemkolo
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/scripts/railway-start.sh ./scripts/railway-start.sh
RUN chmod +x ./scripts/railway-start.sh && chown -R zeemkolo:zeemkolo /app
USER zeemkolo
EXPOSE 5000
# Railway injects PORT; HOST defaults to 0.0.0.0 via env schema / ENV above
CMD ["./scripts/railway-start.sh"]
