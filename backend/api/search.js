export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { matricule } = req.body

  if (!matricule) {
    return res.status(400).json({ error: 'Matricule required' })
  }

  const pdfUrl = `/api/pdf/${matricule.toUpperCase()}`
  return res.json({ pdfUrl })
}
