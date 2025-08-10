# Multi-stage Dockerfile to build and serve the React SPA (Vite)
# Build context: project/frontend
# Place this file at: project/frontend/Dockerfile

# 1) Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Parametriza la URL base del API (se inyecta en build)
ARG VITE_API_BASE_URL="http://localhost:8000"
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# 2) Run stage (Nginx)
FROM nginx:alpine
# Conf para SPA: fallback a index.html para rutas de React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
