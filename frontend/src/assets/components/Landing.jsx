import React from 'react';
import Baby from '../../assets/images/BossBaby-logo-removebg-preview.png';

function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100 font-mono px-6 py-10">
      
      {/* Top Section: Logo */}
      <header className="flex flex-col items-center gap-2 mb-2 justify-center">
        <h1 className="text-gray-500 text-xs sm:text-sm font-light">Made By</h1>
        <img 
          src={Baby} 
          alt="Logo" 
          className="w-16 sm:w-20 md:w-24 drop-shadow-[0_0_4px_cyan] opacity-80"
        />
        <h1 className="text-4xl sm:text-5xl md:text-5xl font-extrabold text-center text-cyan-400 drop-shadow-[0_0_8px_cyan] tracking-wide transition-all duration-300 ease-in-out hover:text-gray-900 hover:scale-105">
            Black Page
        </h1>
      </header>

      {/* Project Info */}
      <main className="flex-1 flex flex-col justify-center items-start gap-6 max-w-2xl">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-cyan-300 drop-shadow-[0_0_4px_cyan]">
          What is this?
        </h2>
        <p className="text-gray-400 text-sm sm:text-base md:text-lg">
          Black Page allows you to <strike>securely</strike> access their exam papers.
          By entering a valid <strong>matricule</strong>, users can retrieve their exam file.
        </p>
        <p className="text-gray-400 text-sm sm:text-base md:text-lg">
          Each search is logged for auditing purposes, and only properly formatted matricules are accepted to ensure security.
        </p>
      </main>
    </div>
  );
}

export default Landing;
