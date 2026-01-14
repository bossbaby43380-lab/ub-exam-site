import fetch from 'node-fetch';
import * as pdfParse from 'pdf-parse';
import { logSearch } from '../../logSearch.js';

function normalizeText(text) {
  return text.toUpperCase().replace(/\s+/g, ' ').replace(/[^A-Z ]/g, '').trim();
}

export default async function handler(req, res) {
  const { matricule } = req.query;
  const userName = req.query.name;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const pdfURL = `${process.env.RESULTS_BASE_URL}/EXAM_${matricule}.pdf`;

  try {
    const response = await fetch(pdfURL, { headers: { 'User-Agent': 'Mozilla/5.0' } });

    if (!response.ok) {
      logSearch({ name: userName || 'UNKNOWN', matricule, ip, status: 'PDF_NOT_FOUND' });
      return res.status(404).send('PDF not found');
    }

    const pdfBuffer = await response.arrayBuffer();

    if (userName) {
      const pdfData = await pdfParse(Buffer.from(pdfBuffer));
      if (!normalizeText(pdfData.text).includes(normalizeText(userName))) {
        logSearch({ name: userName, matricule, ip, status: 'NAME_MISMATCH' });
        return res.status(403).send('Name mismatch');
      }
    }

    logSearch({ name: userName || 'UNKNOWN', matricule, ip, status: 'SUCCESS' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="EXAM_${matricule}.pdf"`);
    res.send(Buffer.from(pdfBuffer));
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}
