import { logSearch } from '../logSearch.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pname, matricule } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (!pname || !matricule) {
    logSearch({ name: pname || 'UNKNOWN', matricule: matricule || 'UNKNOWN', ip, status: 'INVALID_INPUT' });
    return res.status(400).json({ error: 'Name and matricule required' });
  }

  const upperMatricule = matricule.toUpperCase();

  logSearch({ name: pname, matricule: upperMatricule, ip, status: 'SEARCH_INITIATED' });

  // 🔑 THIS LINE IS CORRECT
  const pdfUrl = `/api/pdf/${upperMatricule}?name=${encodeURIComponent(pname)}`;

  return res.json({ pdfUrl });
}
