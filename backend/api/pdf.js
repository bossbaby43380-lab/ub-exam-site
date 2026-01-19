import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { logSearch } from '../../logSearch.js';

// Normalize text for comparison
function normalizeText(text) {
  return text
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .replace(/[^A-Z ]/g, '')
    .trim();
}

export default async function handler(req, res) {
  const matricule = req.query.matricule || req.url.split('/').pop().split('?')[0];
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (!matricule) {
    return res.status(400).send('Matricule is required');
  }

  const pdfURL = `${process.env.RESULTS_BASE_URL}/EXAM_${matricule}.pdf`;

  try {
    // Fetch the PDF from external source
    const response = await fetch(pdfURL, { headers: { 'User-Agent': 'Mozilla/5.0' } });

    if (!response.ok) {
      logSearch({ name: userName || 'UNKNOWN', matricule, ip, status: 'PDF_NOT_FOUND' });
      return res.status(404).send('PDF not found on server');
    }

    const pdfBuffer = await response.arrayBuffer();

    // Optional: verify that the name exists inside the PDF
    if (userName) {
      let pdfData;
      try {
        pdfData = await pdfParse(Buffer.from(pdfBuffer));
      } catch (err) {
        console.error('PDF parsing error:', err);
        return res.status(500).send('Error parsing PDF');
      }

      const normalizedPdfText = normalizeText(pdfData.text);
      const normalizedUserName = normalizeText(userName);

      if (!normalizedPdfText.includes(normalizedUserName)) {
        logSearch({ name: userName, matricule, ip, status: 'NAME_MISMATCH' });
        return res.status(403).send('Name does not match the matricule');
      }
    }

    // Success — return PDF
    logSearch({ name: userName || 'UNKNOWN', matricule, ip, status: 'SUCCESS' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="EXAM_${matricule}.pdf"`);
    res.send(Buffer.from(pdfBuffer));

  } catch (err) {
    console.error('PDF fetch/stream error:', err);
    res.status(500).send('Server error while fetching PDF: ' + err.message);
  }
}
