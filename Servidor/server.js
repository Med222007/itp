// server.js

const express = require("express");
const session = require("express-session");
const cors = require("cors");
const userRoutes = require('./routes/userRoutes');
const rolRoutes = require('./routes/rolRoutes');
const reservaRoutes = require('./routes/reservaRoutes');
const notificacionRoutes = require('./routes/notificacionRoutes');
const databaseRoutes = require("./routes/databaseRoutes");
const reportesRoutes = require("./routes/reportesRoutes");
const authRoutes = require('./routes/authRoutes');
const compression = require('compression');
const errorHandler = require("./middlewares/errorHandlers");
const https = require('https');
const fs = require('fs');
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(session({
    secret: "secreto_super_seguro",
    resave: false,
    saveUninitialized: true,
}));

app.use(compression({ level: 6 }));

app.use('/api', userRoutes);
app.use('/api', rolRoutes);
app.use('/api', reservaRoutes);
app.use('/api', notificacionRoutes);
app.use('/api', databaseRoutes);
app.use('/api', reportesRoutes);
app.use('/api', authRoutes);

app.use(errorHandler);




// Leer los certificados
const httpsOptions = {
    key: fs.readFileSync('./certs/key.pem'),
    cert: fs.readFileSync('./certs/cert.pem'),
};

const PORT = process.env.PORT || 3001;

// Iniciar servidor HTTPS
https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`Servidor HTTPS corriendo en https://localhost:${PORT}`);
});

module.exports = app;
