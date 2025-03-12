# Sécurisation d'une API Express

## 1. Objectif du projet
Ce projet vise à renforcer la sécurité d'une API développée avec Express.js en mettant en place des protections contre les attaques courantes.

## 2. Technologies Utilisées
- **Express.js** : Framework backend Node.js
- **Helmet** : Protection des en-têtes HTTP
- **Express-rate-limit** : Limitation des requêtes pour éviter les attaques DDoS
- **Winston** : Gestion avancée des logs
- **dotenv** : Gestion des variables d'environnement
- **fs** : Manipulation des fichiers pour le stockage des logs

## 3. Fonctionnalités Implémentées

### 3.1 Importation des modules
```javascript
import express from "express";
import winston from "winston";
import helmet from "helmet";
import fs from "fs";
import path from "path";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
```
### 3.2 Configuration et sécurisation de l'API
- Chargement des variables d'environnement
- Sécurisation des en-têtes HTTP
- Limitation du nombre de requêtes

```javascript
dotenv.config();
const app = express();
app.use(helmet());

const limiter = rateLimit({
    windowMs: 3 * 60 * 1000,
    limit: 100,
    message: "Trop de tentatives, veuillez réessayer ultérieurement."
});
app.use(limiter);
```

### 3.3 Gestion des logs avec Winston
- Création du dossier `logs` si inexistant
- Configuration de Winston pour enregistrer les requêtes et erreurs

```javascript
const logDirectory = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        new winston.transports.File({ filename: "logs/combined.log" }),
        new winston.transports.Console({ format: winston.format.simple() })
    ]
});
```

### 3.4 Middleware de journalisation des requêtes
```javascript
app.use((req, res, next) => {
    logger.info(`Requête reçue : ${req.method} ${req.url} - IP : ${req.ip}`);
    next();
});
```

### 3.5 Routes de l'API

- **Route principale**
```javascript
app.get("/", (req, res) => {
    logger.info(`Accès à la page principale depuis ${req.ip}`);
    res.send("Bienvenue sur l'API sécurisée");
});
```

- **Simulation d'une erreur**
```javascript
app.get("/error", (req, res) => {
    logger.error(`Erreur simulée - Requête de ${req.ip}`);
    res.status(500).send("Une erreur est survenue");
});
```

- **Route de connexion avec journalisation des tentatives (mot de passe masqué)**
```javascript
app.post("/login", (req, res) => {
    const login = req.body.login;
    const password = req.body.password;
    const mdp = "*".repeat(password.length);
    logger.info(`Tentative de connexion - Login: ${login}, Password: ${mdp} - IP: ${req.ip}`);
    return res.status(200).json({ message: "Connexion réussie" });
});
```

## 4. Tests et Résultats

### 4.1 Test avec Postman

- **Route `/`** : Affiche "Bienvenue sur l'API sécurisée"
- ![image](https://github.com/user-attachments/assets/40cace4e-ed7b-45b3-99c2-02128a281e00)
![image](https://github.com/user-attachments/assets/a440fe53-c867-4d86-891a-de342228fa1f)

- **Route `/error`** : Renvoie une erreur 500
- ![image](https://github.com/user-attachments/assets/f0c25db5-a013-4654-8fc0-7b3288e87034)
![image](https://github.com/user-attachments/assets/d28dcad1-c002-4bb7-bc89-0b4f345ceacc)

- **Route `/login`** : Enregistre les tentatives avec le mot de passe caché
![image](https://github.com/user-attachments/assets/3ef02ddd-bce7-46da-9f48-c4df8dcca052)
![image](https://github.com/user-attachments/assets/8a9824a0-9df6-4d9c-8c08-57242651fc1a)

### 4.2 Fichiers de logs générés

- **logs/combined.log** : Contient toutes les requêtes et tentatives de connexion
- **logs/error.log** : Enregistre uniquement les erreurs

## 5. Conclusion
Ce projet applique des bonnes pratiques de sécurité en protégeant l'API contre les attaques courantes tout en assurant un suivi efficace des requêtes et erreurs grâce à Winston.

---
📌 **Fait par : Sahmi Lamrani Aya**
