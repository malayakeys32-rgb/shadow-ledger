# Use official Node image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript into dist/
RUN npm run build

# Expose your backend port
EXPOSE 10000

# Start the compiled server
CMD ["node", "dist/server.js"]
