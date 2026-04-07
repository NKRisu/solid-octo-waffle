# Multi-stage build: build React app with Node, then serve with nginx
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
COPY vite.config.js ./vite.config.js
COPY index.html ./
COPY public ./public
COPY src ./src

RUN npm ci
RUN npm run build

FROM nginx:alpine

# Copy built production files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Optional: custom nginx config if you add one
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]