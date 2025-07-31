const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { connectToDatabase } = require('./config/db');
const app = express();
const dotenv = require('dotenv');
const castigadosRoutes = require('./routes/castigadosRoutes');
const loginRoutes = require('./routes/loginRoutes');
const auditoriaRoutes = require('./routes/auditoriaRoutes');

app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));



dotenv.config();
const PORT = process.env.PORT || 3000;


// Cors Configuration
app.use(cors({
    origin: ["http://127.0.0.1:5502", "http://localhost:5000"],
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
        app.listen(PORT, () => {
            console.log(`Servidor iniciado en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('No se pudo conectar a la base de datos. Verifica tu configuración.');
        process.exit(1);
    }
};

startServer();
