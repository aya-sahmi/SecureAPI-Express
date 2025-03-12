import express from "express";
import winston from "winston";
import helmet from "helmet";
import fs from "fs";
import path from "path";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());

const limiter = rateLimit({
    windowMs: 3 * 60 * 1000,
    limit: 100,
    message: "Trop de tentatives veuillez reessayer ulterieurement"
})

app.use(limiter);

const dirname = "C:/Users/admin/Desktop/securite_app/tp_logs"
const logDirectory = path.join(dirname,"logs");
if (!fs.existsSync(logDirectory)){
    fs.mkdirSync(logDirectory);
}

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: "logs/error.log",
            level: "error"
        }),
        new winston.transports.File({
            filename: "logs/combined.log"
        }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
})

app.use((req,resp,next)=>{
    logger.info(`Requête recue : ${req.method} ${req.url} - IP : ${req.ip}`);
    next();
})

app.get("/", (req,resp) => {
    logger.info(`Accès à la page principale depuis ${req.ip} `)
    resp.send("Bienvenue sur l'API sécurisée");
})

app.get("/error", (req,resp)=>{
    logger.error(`Erreur simulée - Requête de ${req.ip}`);
    resp.status(500).send("Une erreur est survenue");
})

app.post("/login", (req, res) => {
    const login = req.body.login;
    const password = req.body.password
    const mdp = "*".repeat(password.length);
    logger.info(`Tentative de connexion - Login: ${login}, Password: ${mdp} - IP: ${req.ip}`);
    return res.status(200).json({ message: "Connexion réussie" });
});


const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Le serveur est lancé sur le port ${PORT}`);
    logger.info(`Le serveur est lancé sur le port ${PORT}`);
})
