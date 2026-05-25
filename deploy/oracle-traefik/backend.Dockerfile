FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY source/backend/package*.json ./
RUN npm ci --omit=dev

COPY source/backend/ ./

EXPOSE 5000

CMD ["node", "server.js"]
