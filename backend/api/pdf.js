export default async function handler(req, res) {
  const matricule = req.query.matricule || req.url.split('/').pop()

  if (!matricule) {
    return res.status(400).send('Matricule required')
  }

  const pdfURL = `${process.env.RESULTS_BASE_URL}/EXAM_${matricule}.pdf`

  try {
    const response = await fetch(pdfURL)

    if (!response.ok) {
      return res.status(404).send('PDF not found')
    }

    const buffer = Buffer.from(await response.arrayBuffer())

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline')
    res.send(buffer)
  } catch (err) {
    console.error(err)
    res.status(500).send('Server error')
  }
}
