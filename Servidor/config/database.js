const mysql = require("mysql2");

const dbConfig = {
  host: "db",
  user: "root",
  password: "40781889",
  database: "usuarios_itp",
  charset: "utf8mb4"
};

const MAX_RETRIES = 10;
let attempts = 0;

const db = mysql.createConnection(dbConfig);

function connectWithRetry() {
  db.connect((err) => {
    if (err) {
      attempts++;
      console.error(`Error de conexión (${attempts}/${MAX_RETRIES}):`, err.message);
      if (attempts < MAX_RETRIES) {
        console.log("Reintentando en 3 segundos...");
        setTimeout(connectWithRetry, 3000);
      } else {
        console.error("Máximos intentos alcanzados. Abortando.");
        process.exit(1);
      }
    } else {
      console.log("Conexión a la base de datos exitosa.");
    }
  });
}

connectWithRetry();

module.exports = db;
