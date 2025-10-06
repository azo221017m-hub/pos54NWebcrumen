// server.js
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth"; // ✅


const app = express();
const PORT = 3000;
// 1️⃣ Permitir CORS desde cualquier origen (útil para pruebas)
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST'],
  credentials: true,
}));
// ✅ Habilitar CORS y JSON

app.use(express.json());

app.use("/api", authRouter);


// 5️⃣ Middleware para log de todas las solicitudes
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.originalUrl} - Body:`, req.body);
  next();
});



// ✅ Levantar el servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor backend corriendo en http://localhost:${PORT}`);
});
