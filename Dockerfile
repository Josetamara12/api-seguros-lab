FROM node:20-alpine

WORKDIR /app

# Instalar dependencias primero (mejor uso de caché de capas)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copiar el resto del código (node_modules queda excluido por .dockerignore)
COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "index.js"]
