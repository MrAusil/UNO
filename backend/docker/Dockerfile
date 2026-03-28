FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "src/server.js"]
