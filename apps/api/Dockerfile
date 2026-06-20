# 1. Tahap Base
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 2. Tahap Builder
FROM base AS builder
WORKDIR /app

# Salin seluruh monorepo
COPY . .

# Berikan jatah RAM agar Turborepo lancar
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Install dependencies dan Build
RUN pnpm install --frozen-lockfile
RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api build

# Perintah ini akan memisahkan NestJS dan "node_modules" produksinya 
# secara rapi ke dalam folder baru bernama /app/out
RUN pnpm deploy --filter api --prod /app/out

# 3. Tahap Runner
FROM base AS runner
WORKDIR /app

# Copy folder hasil deploy (package.json + node_modules)
COPY --from=builder /app/out ./

# --- TAMBAHKAN BARIS INI ---
# Jemput folder dist hasil build yang ditinggalkan pnpm deploy
COPY --from=builder /app/apps/api/dist ./dist

# Install Prisma CLI secara global menggunakan NPM 
RUN npm install -g prisma
RUN npm install dotenv

# Generate client Prisma agar binary-nya sinkron dengan OS Alpine
RUN prisma generate

EXPOSE 3001

# Jalankan migration dan nyalakan server
CMD ["sh", "-c", "prisma migrate deploy && node dist/main.js"]