import express from 'express';
import { probarConexion } from './db.js';
import authRoutes from './routes/auth.js';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/ping-bd', async (req, res) => {
  try {
    const [rows]: any = await (await import('./db.js')).pool.query("SELECT count(*) FROM negociostbl AS ahora");
    res.json({ ok: true, ahora: rows[0].ahora });
  } catch (error) {
    console.error('[ERROR] /api/ping-bd:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al consultar la BD' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  await probarConexion();
});
