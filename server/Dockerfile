# Image de base officielle Node.js 22 LTS sur Alpine Linux (ultra-legere et securisee)
FROM node:22-alpine

# Definition du repertoire de travail
WORKDIR /app

# Installation d'OpenSSL necessaire pour Prisma Engine sur Alpine Linux
RUN apk add --no-cache openssl

# Copie des manifestes de dependances
COPY package*.json ./
COPY prisma ./prisma/

# Installation stricte des dependances et generation du client Prisma
RUN npm ci && npx prisma generate

# Copie du code source applicatif
COPY src ./src

# Variables d'environnement par defaut
ENV NODE_ENV=production
ENV PORT=3000

# Exposition du port reseau
EXPOSE 3000

# Commande de demarrage du serveur
CMD ["node", "src/index.js"]
