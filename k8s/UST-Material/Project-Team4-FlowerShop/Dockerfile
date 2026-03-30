FROM node:20-alpine
LABEL maintainer="Flower App Team"
LABEL description="Flower App — Node.js/Express + MongoDB project"
LABEL version="1.0"
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force
COPY . .
EXPOSE 3015
CMD ["node", "app.js"]
