import { logSearch } from '../logSearch.js';

function validateMatricule(matricule) {
  const facTregex = /^(AR|AV|FE|CT|ED|HS|HP|HT)\d{2}A\d{3}$/;
  const asRegex = /^(AS|HC)\d{2}P\d{3}$/;
  return facTregex.test(matricule) || asRegex.test(matricule);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pname, matricule } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

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

  const pdfUrl = `/api/pdf/${upperMatricule}?name=${encodeURIComponent(pname)}`;
  return res.json({ pdfUrl });
}
