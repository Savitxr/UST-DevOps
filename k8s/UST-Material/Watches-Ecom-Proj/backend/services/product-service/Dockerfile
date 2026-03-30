FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install 
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY src ./src
EXPOSE 8082
CMD ["node", "src/index.js"]
