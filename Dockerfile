# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build -- --configuration production

# Production stage
FROM nginx:alpine

# Copy built files from builder
# Angular 21 outputs to dist/resume-customizer-frontend/browser
COPY --from=builder /app/dist/resume-customizer-frontend/browser /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3000 (frontend port, backend uses 8080)
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
