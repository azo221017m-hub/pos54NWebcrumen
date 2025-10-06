// src/config.ts
// Definir la URL base de la API
// Si no hay variable de entorno VITE_API_URL, se usa la URL remota
export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://pos54nwebcrumenbackend.onrender.com";
