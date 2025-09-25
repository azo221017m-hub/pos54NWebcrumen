// src/index.ts
import express from 'express';
import cors from 'cors'; // <--- importar CORS
import { probarConexion } from './db.js';
import authRoutes from './routes/auth.js';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

// 1️⃣ Permitir CORS desde cualquier origen (útil para pruebas)
app.use(cors({
  origin: "*", // o la URL exacta de tu frontend en Render
}));

// 2️⃣ Parsear JSON
app.use(express.json());

// 3️⃣ Rutas de autenticación
app.use('/api/auth', authRoutes);

// 4️⃣ Ping para probar conexión a la BD
app.get('/api/ping-bd', async (req, res) => {
  try {
    const [rows]: any = await (await import('./db.js')).pool.query("SELECT NOW() AS ahora");
    console.log('[PING-BD] Respuesta:', rows[0].ahora);
    res.json({ ok: true, ahora: rows[0].ahora });
  } catch (error) {
    console.error('[ERROR] /api/ping-bd:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al consultar la BD' });
  }
});

// 5️⃣ Middleware para log de todas las solicitudes
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.originalUrl} - Body:`, req.body);
  next();
});


app.get('/', (req, res) => {
  res.send('Backend CrumenPosWeb funcionando ✅');
});

// 6️⃣ Arrancar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  await probarConexion();
});
