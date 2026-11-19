FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY server.js ./
COPY data/ ./data/
COPY public/ ./public/

EXPOSE 5000

ENV PORT=5000

CMD ["node", "server.js"]
