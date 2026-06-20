FROM node:22-slim AS base
RUN corepack enable
WORKDIR /app

# 1. Copy cuma file yang nentuin dependency dulu — biar layer ini di-cache
#    selama package.json/lockfile nggak berubah
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/*/package.json ./packages/*/
RUN pnpm install --frozen-lockfile

# 2. Baru copy source code & build
FROM deps AS build
COPY . .
RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api build

# 3. Runtime image yang ramping, tanpa devDependencies
FROM node:22-slim AS runner
WORKDIR /app
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/node_modules ./node_modules
COPY --from=build /app/node_modules/.pnpm ./node_modules/.pnpm
EXPOSE 3001
CMD ["node", "dist/main.js"]