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
# Stage 3: Production Runner (HF Spaces & Cloud Docker Compatible)
# ============================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=7860
ENV GOOGLE_DRIVE_TARGET_EMAIL="umeshmabatuwana@gmail.com"

# Set up non-root user (UID 1000) for Hugging Face Spaces & security
RUN adduser -D -u 1000 user && mkdir -p /app/backend/prisma && chown -R user:user /app

# Copy backend dependencies and build
COPY --chown=user:user backend/package*.json ./backend/
COPY --chown=user:user backend/prisma ./backend/prisma/
WORKDIR /app/backend
RUN npm ci --omit=dev
RUN npx prisma generate

COPY --chown=user:user --from=backend-builder /app/backend/dist ./dist
# Copy built frontend assets for unified hosting
COPY --chown=user:user --from=frontend-builder /app/frontend/dist /app/frontend/dist

RUN chown -R user:user /app

USER user

# Expose cloud port
EXPOSE 7860

# Apply database schema and launch unified server
CMD ["sh", "-c", "npx prisma db push && node dist/server.js"]
