import React, { useState } from 'react';


function Search() {
  const [pname, setName] = useState('');
  const [matricule, setMatricule] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState('');

 const handleSearch = async () => {
  if (!pname || !matricule) {
    setError("Both Name and Matricule are required");
    setPdfUrl(null);
    return;
  }

  try {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

    const res = await fetch(`${BACKEND_URL}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pname: pname.trim().toUpperCase(),
        matricule: matricule.toUpperCase()
      }),
    });

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error('Invalid server response');
    }

    if (!res.ok) {
      setPdfUrl(null);
      setError(data?.error || 'Access denied');
      return;
    }

    setPdfUrl(data.pdfUrl);
    setError('');
  } catch (err) {
    console.error(err);
    setPdfUrl(null);
    setError('Error fetching PDF');
  }
};


return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-gray-100 font-mono px-4 py-10">

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-cyan-400 mb-6 drop-shadow-[0_0_6px_cyan]">
        Start Search
      </h1>

      {/* Inputs */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md mb-6">
        <input
          type="text"
          placeholder="Your Name"
          value={pname}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg py-2 px-4 bg-gray-800 text-cyan-300 placeholder-cyan-500 border border-cyan-400/30 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40 transition shadow-md"
        />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md mb-6">
        <input
          type="text"
          placeholder="Enter your Matricule"
          value={matricule}
          onChange={(e) => setMatricule(e.target.value)}
          className="flex-1 rounded-lg py-2 px-4 bg-gray-800 text-cyan-300 placeholder-cyan-500 border border-cyan-400/30 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40 transition shadow-md"
        />
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="mb-6 rounded-lg bg-cyan-500 text-black font-semibold py-2 px-6 hover:bg-cyan-600 hover:shadow-[0_0_15px_cyan] transition-all"
      >
        Search
      </button>

      {/* Error */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* PDF iframe */}

      {pdfUrl && (
        <div className="w-full max-w-3xl h-150 mb-10 border border-cyan-400 rounded-lg overflow-hidden shadow-lg">
          <iframe
            src={pdfUrl} // <- comes from backend /search response
            title="Exam PDF"
            className="w-full h-full"
            frameBorder="0"
          />
        </div>
      )}


      {/* Footer */}
      <footer className="mt-12 text-gray-500 text-sm sm:text-base tracking-widest text-center">
        © 2026 Black Page. All rights reserved.
      </footer>

    </div>
  );
}

export default Search;
