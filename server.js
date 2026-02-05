require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Conexión a PostgreSQL (Supabase)
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }   // 🔹 Importante para Supabase
});

// -------------------
// Ruta de prueba
// -------------------
app.get('/', (req, res) => {
  res.send('Backend funcionando');
});

// -------------------
// LOGIN
// -------------------
app.post('/login', async (req, res) => {
  try {
    const { cedula, password } = req.body;

    const result = await pool.query(
      'SELECT cedula, nombre, rol FROM usuarios WHERE cedula=$1 AND password=$2',
      [cedula, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en login' });
  }
});

// -------------------
// CONSULTAR VENTAS
// -------------------
app.get('/ventas_movil/:cedula_asesor', async (req, res) => {
  try {
    const { cedula_asesor } = req.params;

    const result = await pool.query(
      `SELECT 
        cedula_asesor,
        nombre_asesor,
        rut,
        nombre_cliente,
        estado_venta,
        fecha_venta,
        fecha_activacion,
        tel_contacto,
        tipo_venta
       FROM ventas_movil
       WHERE cedula_asesor = $1`,
      [cedula_asesor]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Error consultando ventas:', error);
    res.status(500).json({ error: 'Error consultando ventas' });
  }
});

// -------------------

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Servidor corriendo en puerto ' + PORT);
});
