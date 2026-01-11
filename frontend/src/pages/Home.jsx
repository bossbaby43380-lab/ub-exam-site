import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const [matricule, setMatricule] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    if (!matricule) return
    navigate(`/result/${matricule}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <form
        onSubmit={handleSubmit}
        className="bg-card p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h1 className="text-2xl font-semibold text-center mb-6">
          Check Your Result
        </h1>

        <input
          type="text"
          placeholder="Enter your Matricule"
          value={matricule}
          onChange={(e) => setMatricule(e.target.value)}
          className="w-full border rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <button
          type="submit"
          className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:opacity-90"
        >
          Check Result
        </button>
      </form>
    </div>
  )
}
