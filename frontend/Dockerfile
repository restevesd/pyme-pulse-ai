# 1) Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
# Parametriza la URL base del API (se inyecta en build)
ARG VITE_API_BASE_URL="http://localhost:8000"
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# 2) Run stage (Nginx)
FROM nginx:1.25-alpine
# limpia default y agrega nuestra config
RUN rm /etc/nginx/conf.d/default.conf
# Conf para SPA: fallback a index.html para rutas de React Router
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]