import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Multer setup
const upload = multer({ dest: path.join(__dirname, 'uploads/') });

app.post('/upload-resume', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const ext = path.extname(file.originalname).toLowerCase();
    let text = '';

    if (ext === '.pdf') {
      const buffer = await fs.readFile(file.path);
      const uint8Array = new Uint8Array(buffer);

      const pdfDoc = await pdfjsLib.getDocument({
        data: uint8Array,
        disableWorker: true
      }).promise;

      let fullText = '';
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(' ') + '\n';
      }
      text = fullText.trim();
    } else if (ext === '.docx') {
      const buffer = await fs.readFile(file.path);
      const result = await mammoth.extractRawText({ buffer });
      text = result.value.trim();
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Use PDF or DOCX.' });
    }

    if (!text) throw new Error('Failed to extract text');

    res.json({ text });
  } catch (err) {
    console.error('Error parsing resume:', err);
    res.status(500).json({ error: err.message || 'Failed to parse resume.' });
  } finally {
    if (req.file?.path) await fs.unlink(req.file.path).catch(() => {});
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
