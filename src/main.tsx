import React from 'react';
import ReactDOM from 'react-dom/client';
import MasterEngineShell from './MasterEngineShell.jsx';

ReactDOM.createRoot(document.getElementById('app') || document.body).render(
  <React.StrictMode>
    <MasterEngineShell />
  </React.StrictMode>
);
