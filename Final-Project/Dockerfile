# Multi-stage build: build React app with Node, then serve with nginx
FROM node:20-alpine AS build
WORKDIR /app

COPY final-project/package.json final-project/package-lock.json* ./
COPY final-project/vite.config.js ./vite.config.js
COPY final-project/index.html ./
COPY final-project/public ./public
COPY final-project/src ./src

RUN npm ci
RUN npm run build

FROM nginx:alpine

# Copy built production files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Optional: custom nginx config if you add one
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]