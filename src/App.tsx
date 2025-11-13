import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import Auth from './components/Auth';
import Header from './components/Header';
import Routines from './components/Routines';
import { APP_VERSION, APP_BUILD_TIME } from './version';
import { usePwaUpdate } from './usePwaUpdate';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const { show, update } = usePwaUpdate();

  useEffect(() => {
    // Any side effects can be handled here
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div>
        {user ? (
          <>
            <Header />
            <Routines />
          </>
        ) : (
          <Auth />
        )}
        {show && (
          <div style={{ position: 'fixed', bottom: 40, right: 8, background: '#22c55e', color: '#fff', padding: '8px 16px', borderRadius: 8, fontWeight: 600, zIndex: 10000, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
            New version available!
            <button style={{ marginLeft: 12, background: '#fff', color: '#22c55e', border: 'none', borderRadius: 4, padding: '4px 10px', fontWeight: 700, cursor: 'pointer' }} onClick={update}>Update</button>
          </div>
        )}
        <div style={{ position: 'fixed', bottom: 4, right: 8, fontSize: '0.7em', color: '#888', opacity: 0.7, zIndex: 9999 }}>
          v{APP_VERSION} <span title={APP_BUILD_TIME}>{APP_BUILD_TIME.slice(0, 10)} {APP_BUILD_TIME.slice(11, 16)}</span>
        </div>
      </div>
    </Router>
  );
};

export default App;