import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import RoutesConfig from './routes';
import { AuthProvider } from './state/authContext';

function TopBar() {
  return (
    <div className="topbar" role="navigation" aria-label="Top Navigation">
      <div className="topbar-title">RideShare Pro</div>
      <div className="topbar-actions">
        <a className="icon-btn" href="/history" aria-label="History">History</a>
        <a className="icon-btn" href="/profile" aria-label="Profile">Profile</a>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** Root app shell with Router and AuthProvider. */
  return (
    <div className="app-shell">
      <BrowserRouter>
        <AuthProvider>
          <TopBar />
          <RoutesConfig />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
