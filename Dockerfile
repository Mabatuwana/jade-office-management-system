# ============================================================
# Stage 1: Build Frontend
# ============================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ============================================================
# Stage 2: Build Backend
# ============================================================
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm ci
RUN npx prisma generate
COPY backend/ ./
RUN npm run build

# ============================================================
# Stage 3: Production Runner
# ============================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV GOOGLE_DRIVE_TARGET_EMAIL="umeshmabatuwana@gmail.com"

# Copy backend dependencies and build
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma/
WORKDIR /app/backend
RUN npm ci --omit=dev
RUN npx prisma generate

COPY --from=backend-builder /app/backend/dist ./dist
# Copy built frontend assets for unified hosting
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Expose production port
EXPOSE 5000

# Apply database schema and launch unified server
CMD ["sh", "-c", "npx prisma db push && node dist/server.js"]
