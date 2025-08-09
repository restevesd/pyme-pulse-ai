# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Instala deps
COPY frontend/package*.json ./
# Si usas bun.lockb, puedes cambiar a bun; con npm:
RUN --mount=type=cache,target=/root/.npm npm ci

# Copia código y build
COPY frontend/ .
RUN npm run build

# ---- run stage (nginx) ----
FROM nginx:1.25-alpine
# limpia default y agrega nuestra config
RUN rm /etc/nginx/conf.d/default.conf
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copia artefactos estáticos
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80