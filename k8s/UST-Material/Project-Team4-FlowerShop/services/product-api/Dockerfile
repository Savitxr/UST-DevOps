FROM node:20-alpine
LABEL service="product-api"
LABEL maintainer="AFF Team"
RUN apk add --no-cache wget
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force
COPY . .
EXPOSE 3002
HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3002/health || exit 1
CMD ["node", "app.js"]
