import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import Auth from './components/Auth';
import Header from './components/Header';
import Routines from './components/Routines';

const App: React.FC = () => {
  const { user, loading } = useAuth();

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
        <div style={{ position: 'fixed', bottom: 4, right: 8, fontSize: '0.7em', color: '#888', opacity: 0.7, zIndex: 9999 }}>
          v1.1.0
        </div>
      </div>
    </Router>
  );
};

export default App;