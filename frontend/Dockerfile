# Development image: runs the Vite dev server with HMR.
# Phase 7 adds a multi-stage production build that emits static files for Nginx.
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5173

# --host binds 0.0.0.0 so the port is reachable from outside the container.
CMD ["npm", "run", "dev", "--", "--host"]
