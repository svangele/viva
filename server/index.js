import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const PROPERTIES_DIR = path.join(__dirname, '../public/propiedades');
fs.ensureDirSync(PROPERTIES_DIR);

// Storage configuration with original filename
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, PROPERTIES_DIR);
    },
    filename: (req, file, cb) => {
        // Clean filename to avoid issues
        const cleanName = file.originalname.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        cb(null, Date.now() + '-' + cleanName);
    }
});

const upload = multer({ storage });

// Admin credentials
const ADMIN_USER = 'AdminV';
const ADMIN_PASS = 'Vargas2026#';

// Routes
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        res.json({ success: true, token: 'mock-token-for-local-use' });
    } else {
        res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
});

app.get('/api/properties', async (req, res) => {
    try {
        const files = await fs.readdir(PROPERTIES_DIR);
        const images = files.filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
        res.json(images);
    } catch (err) {
        res.status(500).json({ error: 'Error al leer la carpeta de propiedades' });
    }
});

app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se subió ninguna imagen' });
    res.json({ filename: req.file.filename });
});

app.delete('/api/properties/:filename', async (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(PROPERTIES_DIR, filename);
    try {
        if (await fs.pathExists(filePath)) {
            await fs.remove(filePath);
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Archivo no encontrado' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar el archivo' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor de gestión de propiedades corriendo en http://localhost:${PORT}`);
});
