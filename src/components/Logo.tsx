import React from 'react';

const Logo: React.FC = () => {
    return (
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="28" width="44" height="8" rx="4" fill="#4F8A8B" />
                <rect x="6" y="22" width="8" height="20" rx="4" fill="#F9DC5C" />
                <rect x="50" y="22" width="8" height="20" rx="4" fill="#F9DC5C" />
                <path d="M22 44L30 52L46 36" stroke="#4F8A8B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontWeight: 700, fontSize: 24, color: '#4F8A8B', letterSpacing: 1 }}>GymTracker</span>
        </div>
    );
};

export default Logo;