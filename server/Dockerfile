FROM node:20-slim

WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create models directory for Transformers.js caching
RUN mkdir -p /app/models /app/uploads

# Set environment variables
ENV NODE_ENV=production
ENV EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2
ENV PORT=8000

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["npm", "start"]