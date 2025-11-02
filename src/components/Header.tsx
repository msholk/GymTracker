import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import Logo from './Logo';

const Header: React.FC = () => {
    const { user, logout } = useAuth();

    // Responsive: show only icon on narrow screens
    const [isNarrow, setIsNarrow] = useState(false);
    useEffect(() => {
        const handleResize = () => setIsNarrow(window.innerWidth < 500);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <header className="header">
            <Logo />
            {user ? (
                <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f4f6f8', borderRadius: '20px', padding: '6px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    {isNarrow ? (
                        <button
                            onClick={logout}
                            title="Sign Out"
                            style={{ background: '#4F8A8B', color: '#fff', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer', fontWeight: 600, fontSize: 18, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                            onMouseOver={e => (e.currentTarget.style.background = '#357376')}
                            onMouseOut={e => (e.currentTarget.style.background = '#4F8A8B')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        </button>
                    ) : (
                        <>
                            <span style={{ fontWeight: 500, color: '#333', fontSize: 16 }}>{user.displayName || user.email}</span>
                            <button
                                onClick={logout}
                                style={{ background: '#4F8A8B', color: '#fff', border: 'none', borderRadius: '12px', padding: '6px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'background 0.2s' }}
                                onMouseOver={e => (e.currentTarget.style.background = '#357376')}
                                onMouseOut={e => (e.currentTarget.style.background = '#4F8A8B')}
                            >Sign Out</button>
                        </>
                    )}
                </div>
            ) : null}
        </header>
    );
};

export default Header;