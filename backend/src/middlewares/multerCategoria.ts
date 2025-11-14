// Middleware base para manejo de archivos con Multer
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/categorias/'));
  },
  filename: (req, file, cb) => {
    cb(null, `categoria-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  }
});

const uploadCategoria = multer({ storage });

export default uploadCategoria;
