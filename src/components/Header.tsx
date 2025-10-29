import React from 'react';
import useAuth from '../hooks/useAuth';
import Logo from './Logo';

const Header: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className="header">
            <Logo />
            {user ? (
                <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f4f6f8', borderRadius: '20px', padding: '6px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    <span style={{ fontWeight: 500, color: '#333', fontSize: 16 }}>{user.displayName || user.email}</span>
                    <button onClick={logout} style={{ background: '#4F8A8B', color: '#fff', border: 'none', borderRadius: '12px', padding: '6px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'background 0.2s' }}
                        onMouseOver={e => (e.currentTarget.style.background = '#357376')}
                        onMouseOut={e => (e.currentTarget.style.background = '#4F8A8B')}
                    >Sign Out</button>
                </div>
            ) : null}
        </header>
    );
};

export default Header;