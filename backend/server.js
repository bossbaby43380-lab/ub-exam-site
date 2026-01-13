import express from 'express';
import cors from 'cors';
import fs from 'fs';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ---------------------
// Helper: Validate Matricule
function validateMatricule(matricule) {

  // AR, FE, CT, HS + 2 digits (year) + A + 3 digits
  const facTregex = /^(AR|AV|FE|CT|ED|HS|HP|HT)\d{2}A\d{3}$/;

  // AS → only P
  const asRegex = /^(AS|HC)\d{2}P\d{3}$/;

  return facTregex.test(matricule) || asRegex.test(matricule);
}

// Helper: Log Search
function logSearch(pname, matricule, ip) {
  const logEntry = {
    pname: pname || 'Unknown',
    matricule,
    ip,
    timestamp: new Date().toISOString(),
  };
  fs.appendFileSync('search_logs.json', JSON.stringify(logEntry) + '\n', 'utf-8');
}

// ---------------------
// POST /search: returns iframe URL
app.post('/search', (req, res) => {
  const { pname, matricule } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';

  // Validate input
  if (!pname || !matricule) {
    return res.status(400).json({ error: 'Name and matricule are required.' });
  }

  if (!validateMatricule(matricule)) {
    return res.status(400).json({ error: 'Invalid matricule format.' });
  }

  // Log the search
  logSearch(pname, matricule.toUpperCase(), ip);

  // Return the iframe URL — frontend will use this
  return res.json({ pdfUrl: `/pdf/${matricule.toUpperCase()}` });
});

// ---------------------
// GET /pdf/:matricule -> streams PDF from external server
app.get('/pdf/:matricule', async (req, res) => {
  const { matricule } = req.params;
  const pdfURL = `${process.env.RESULTS_BASE_URL}/EXAM_${matricule}.pdf`;

  try {
    // Fetch PDF from external URL
    const response = await fetch(pdfURL, {
      headers: { 'User-Agent': 'Mozilla/5.0' }, // Mimic browser
      redirect: 'follow',                        // Follow redirects if any
    });

    if (!response.ok) {
      return res.status(404).send('PDF not found');
    }

    // Set headers for inline PDF display in iframe
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="EXAM_${matricule}.pdf"`
    );

    // Stream PDF directly to browser
    response.body.pipe(res);

  } catch (err) {
    console.error('Error streaming PDF:', err);
    res.status(500).send('Server error while fetching PDF');
  }
});

// ---------------------
// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
