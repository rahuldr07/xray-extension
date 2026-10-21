import React from 'react';
import { createRoot } from 'react-dom/client';

// Placeholder for the SQL page (sql.html). Task 7 replaces SqlApp with the client UI.
function SqlApp() {
  return <main aria-label="XRAY SQL">XRAY SQL</main>;
}

const root = document.getElementById('xray-sql-root');
if (root) createRoot(root).render(<SqlApp />);
