import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import * as pdfParse from 'pdf-parse';
import { logSearch } from '../logSearch.js'; // DB logger

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ----------------------
// Middleware
// ----------------------
app.use(cors()); // Accept requests from any origin; can restrict in production
app.use(express.json());

// ----------------------
// Helper: Normalize names
// ----------------------
function normalizeText(text) {
  return text
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .replace(/[^A-Z ]/g, '') // remove weird symbols
    .trim();
}

// ----------------------
// Helper: Validate Matricule
// ----------------------
function validateMatricule(matricule) {
  // Faculties with letter A
  const facTregex = /^(AR|AV|FE|CT|ED|HS|HP|HT)\d{2}A\d{3}$/;
  // AS or HC → letter P
  const asRegex = /^(AS|HC)\d{2}P\d{3}$/;
  return facTregex.test(matricule) || asRegex.test(matricule);
}

// ----------------------
// POST /search
// Returns URL for PDF iframe
// ----------------------
app.post('/search', (req, res) => {
  const { pname, matricule } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';

  if (!pname || !matricule) {
    logSearch({ name: pname || 'UNKNOWN', matricule: matricule || 'UNKNOWN', ip, status: 'INVALID_INPUT' });
    return res.status(400).json({ error: 'Name and matricule are required.' });
  }

  const upperMatricule = matricule.toUpperCase();

  if (!validateMatricule(upperMatricule)) {
    logSearch({ name: pname, matricule: upperMatricule, ip, status: 'INVALID_MATRICULE' });
    return res.status(400).json({ error: 'Invalid matricule format.' });
  }

  logSearch({ name: pname, matricule: upperMatricule, ip, status: 'SEARCH_INITIATED' });

  // ----------------------
  // VERCEL-READY: return relative API path
  // Frontend will request /api/pdf/...
  // ----------------------
  const pdfUrl = `/api/pdf/${upperMatricule}?name=${encodeURIComponent(pname)}`;

  return res.json({ pdfUrl });
});

// ----------------------
// GET /api/pdf/:matricule -> fetch PDF from external server
// ----------------------
app.get('/api/pdf/:matricule', async (req, res) => {
  const { matricule } = req.params;
  const userName = req.query.name;
  const pdfURL = `${process.env.RESULTS_BASE_URL}/EXAM_${matricule}.pdf`;

  try {
    // Fetch PDF as array buffer
    const response = await fetch(pdfURL, { headers: { 'User-Agent': 'Mozilla/5.0' } });

    if (!response.ok) {
      logSearch({ name: userName || 'UNKNOWN', matricule, ip: req.ip, status: 'PDF_NOT_FOUND' });
      return res.status(404).send('PDF not found');
    }

    const pdfBuffer = await response.arrayBuffer();

    // Name verification
    if (userName) {
      const pdfData = await pdfParse(Buffer.from(pdfBuffer));
      const normalizedPdfText = normalizeText(pdfData.text);
      const normalizedUserName = normalizeText(userName);

      if (!normalizedPdfText.includes(normalizedUserName)) {
        logSearch({ name: userName, matricule, ip: req.ip, status: 'NAME_MISMATCH' });
        return res.status(403).send('Name does not match matricule');
      }
    }

    // Success
    logSearch({ name: userName || 'UNKNOWN', matricule, ip: req.ip, status: 'SUCCESS' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="EXAM_${matricule}.pdf"`);
    res.send(Buffer.from(pdfBuffer));
  } catch (err) {
    console.error('Error streaming PDF:', err);
    res.status(500).send('Server error while fetching PDF');
  }
});

// ----------------------
// Start server (local testing only)
// ----------------------
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app; // Needed for Vercel serverless functions
