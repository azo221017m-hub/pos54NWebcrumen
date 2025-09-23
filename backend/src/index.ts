import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';  // NOTA: .js aunque sea TS
import { probarConexion } from './db.js';    // NOTA: .js aunque sea TS

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  await probarConexion(); // solo llamar la función async
});