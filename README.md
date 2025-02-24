# Filmothèque CL - Backend API

## 📋 Description
Filmothèque CL est une API REST développée avec Node.js et le framework Hapi. Ce projet backend permet de gérer une bibliothèque de films avec des fonctionnalités avancées comme la gestion des favoris, l'export CSV et les notifications par email.

## 🚀 Fonctionnalités principales
- Authentification JWT avec gestion des rôles (admin/user)
- CRUD complet pour les films
- Gestion des favoris par utilisateur
- Notifications email automatiques (nouveau film, mise à jour, etc.)
- Export CSV des films (pour les admins)
- Documentation API avec Swagger

## 🛠 Technologies utilisées
- Node.js
- Hapi Framework
- Schwifty (ORM)
- RabbitMQ (File de messages)
- MySQL (Base de données)
- Docker
- Swagger (Documentation API)
- Nodemailer (Envoi d'emails)

## ⚙️ Prérequis
- Node.js (v14 ou supérieur)
- Docker et Docker Compose
- NPM ou Yarn
- RabbitMQ

## 🔧 Installation

1. Cloner le repository :
```bash
https://github.com/leocdt/Projet-R6.05.git
cd Projet-R6.05
```

2. Installer les dépendances :
```bash
npm install
```


3. Lancer le conteneur Docker hapi-mysql pour la base de données :
```bash
docker run -d --name hapi-mysql -e MYSQL_ROOT_PASSWORD=hapi -e MYSQL_DATABASE=user -p 3307:3306 mysql:8.0 --default-authentication-plugin=mysql_native_password
```

4. Il vous faut RabbitMQ pour pouvoir utiliser les files de messages, vous avez 2 manières de l'installer :

- **Option 1 : L'installer manuellement**
https://www.rabbitmq.com/download.html

- **Option 2 : Utiliser Docker**
```bash
docker run -d --name hapi-rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```


5. Exécuter les migrations :
```bash
npx knex migrate:latest
```

6. Lancer le serveur :
```bash
node server
```
Puis accéder à l'interface Swagger :
http://localhost:3000/documentation


## 📝 Configuration

Les variables d'environnement sont déjà configurées dans le fichier `.env` : 

Configuration de l'email
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=guillermo.harris@ethereal.email
EMAIL_PASS=yFz9pCZMy3gMBkPqYH
EMAIL_FROM="Filmotheque CL <noreply@filmothequeCL.com>"

Configuration de la base de données
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=hapi
DB_NAME=user

RABBITMQ_URL=amqp://localhost


## 👥 Rôles et permissions

## 📨 Système de notifications

Le système envoie automatiquement des emails pour :
- Création de compte utilisateur (email de bienvenue)
- Ajout d'un nouveau film (tous les utilisateurs)
- Mise à jour d'un film (utilisateurs l'ayant en favori)
- Export CSV des films (admins)

## 🔄 Export CSV

Les admins peuvent exporter la liste des films en CSV :
1. Requête POST vers `/movies/export`
2. Traitement asynchrone via RabbitMQ
3. Réception du fichier par email

## 🐛 Debugging

Les logs sont disponibles dans la console et incluent :
- Connexions à la base de données
- Requêtes API
- Envois d'emails (avec URLs de prévisualisation Ethereal)
- Messages RabbitMQ