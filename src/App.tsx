import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import Auth from './components/Auth';
import Header from './components/Header';
import Notes from './components/Notes';

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
            <Notes />
          </>
        ) : (
          <Auth />
        )}
      </div>
    </Router>
  );
};

export default App;