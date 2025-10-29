import React from 'react';
import useAuth from '../hooks/useAuth';
import Logo from './Logo';

const Header: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className="header">
            <Logo />
            {user ? (
                <div className="user-info">
                    <span>{user.displayName || user.email}</span>
                    <button onClick={logout}>Sign Out</button>
                </div>
            ) : null}
        </header>
    );
};

export default Header;