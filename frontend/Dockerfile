# Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* frontend/pnpm-lock.yaml* ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Runtime
FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# Solo prod deps (si usas npm ci --omit=dev ya no copies node_modules)
RUN npm ci --omit=dev
EXPOSE 3000
CMD ["npm", "start"]  # "start": "next start"