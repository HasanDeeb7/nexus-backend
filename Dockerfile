FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
# --------------------------------------
FROM builder AS runner

EXPOSE 3000 

WORKDIR /app

CMD ["npm", "run", "dev"]
