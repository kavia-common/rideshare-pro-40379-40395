import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './leaflet.css';

// Attempt to import Leaflet's CSS (will be overridden if present)
try {
  // eslint-disable-next-line global-require
  require('leaflet/dist/leaflet.css');
} catch (e) {
  // no-op: dependency may not be installed in CI lint step; local fallback is used
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
