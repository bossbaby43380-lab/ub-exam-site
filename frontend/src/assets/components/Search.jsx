import { useState } from 'react'

export default function Search() {
  const [matricule, setMatricule] = useState('')
  const [pdfUrl, setPdfUrl] = useState(null)
  const [error, setError] = useState('')

  async function handleSearch() {
    if (!matricule) {
      setError('Matricule is required')
      setPdfUrl(null)
      return
    }

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricule }),
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg)
      }

      const { pdfUrl } = await res.json()
      setPdfUrl(pdfUrl)
      setError('')
    } catch (err) {
      console.error(err)
      setPdfUrl(null)
      setError('Error fetching PDF')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center px-4 py-10">
      <h1 className="text-4xl text-cyan-400 mb-6">Search Result</h1>

      <input
        type="text"
        placeholder="Enter matricule"
        value={matricule}
        onChange={e => setMatricule(e.target.value)}
        className="mb-4 px-4 py-2 rounded bg-gray-800 border border-cyan-400"
      />

      <button
        onClick={handleSearch}
        className="mb-6 px-6 py-2 bg-cyan-500 text-black rounded"
      >
        Search
      </button>

      {error && <p className="text-red-500">{error}</p>}

      {pdfUrl && (
        <iframe
          src={pdfUrl}
          className="w-full max-w-4xl h-[80vh] border"
          title="Exam PDF"
        />
      )}
    </div>
  )
}
