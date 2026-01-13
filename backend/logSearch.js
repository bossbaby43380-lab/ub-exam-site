import db from './db.js';

export function logSearch({ name, matricule, ip, status }) {
  const faculty = matricule?.slice(0, 2) || 'UNKNOWN';

  db.prepare(`
    INSERT INTO searches (name, matricule, faculty, ip, status)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    name,
    matricule,
    faculty,
    ip,
    status
  );
}
