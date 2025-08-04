const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { connectToDatabase } = require('./config/db');
const app = express();
const dotenv = require('dotenv');
const castigadosRoutes = require('./routes/castigadosRoutes');
const loginRoutes = require('./routes/loginRoutes');
const auditoriaRoutes = require('./routes/auditoriaRoutes');

// Carga el archivo .env correcto según el entorno
dotenv.config({
  path: `.env.${process.env.NODE_ENV || 'development'}` // Por defecto usa .env.development
});

const PORT = process.env.PORT || 5006;

// Configuración de sesión (usa JWT_SECRET del .env cargado)
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Cors Configuration
app.use(cors({
    origin: [
        "http://srv-bog-tes.coopserp.com/",
        "http://190.66.10.148:10704"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API running successfully!');
});

// Rutas
app.use('/api', castigadosRoutes);
app.use('/api', loginRoutes);
app.use('/api', auditoriaRoutes);

const startServer = async () => {
    try {
        await connectToDatabase();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`
              ========================================
              🚀 Servidor iniciado en modo ${process.env.NODE_ENV}
              📡 Escuchando en el puerto: ${PORT}
              ========================================
            `);
        });        
    } catch (error) {
        console.error('Error al iniciar el servidor:', error.message);
        process.exit(1);
    }
};

startServer();