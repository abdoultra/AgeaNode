# Étape 1 : Choisir l'image Node
FROM node:20-bookworm-slim
# Étape 2 : Définir le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Étape 3 : Copier les fichiers de configuration
COPY package*.json ./

# Étape 4 : Installer les dépendances
RUN npm install

# Étape 5 : Copier tout le code du projet
COPY . .

# Étape 6 : Exposer le port
EXPOSE 5173

# Étape 7 : Lancer l’application
CMD ["npm", "run", "dev"]