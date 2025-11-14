// backend/src/middlewares/multerCategorias.ts
import multer from 'multer';

// Almacena la imagen en memoria para procesar como base64
import path from 'path';

// Almacena la imagen en disco físico en /uploads/categorias/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/categorias/'));
  },
  filename: function (req, file, cb) {
    // Nombre único: categoria-<timestamp>-<originalname>
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'categoria-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadCategoriaImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

export default uploadCategoriaImage;
