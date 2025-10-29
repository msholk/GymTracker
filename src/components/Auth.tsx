import React, { useState } from 'react';
import Logo from './Logo';
import { signInWithGoogle } from '../firebase/googleSignIn';
import { auth } from '../firebase/config';

const Auth: React.FC = () => {
    const [error, setError] = useState('');

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(String(err));
            }
        }
    };

    const handleSignOut = async () => {
        try {
            await auth.signOut();
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(String(err));
            }
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', background: '#f4f6f8', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', maxWidth: 380, margin: '48px auto', padding: 40 }}>
            <div style={{ marginBottom: 24 }}><Logo /></div>
            {error && <p style={{ color: '#d32f2f', marginBottom: 16 }}>{error}</p>}
            <button
                onClick={handleGoogleSignIn}
                style={{
                    background: '#4F8A8B',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '12px 28px',
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    transition: 'background 0.2s',
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#357376')}
                onMouseOut={e => (e.currentTarget.style.background = '#4F8A8B')}
            >
                <svg width="22" height="22" viewBox="0 0 48 48" style={{ background: 'white', borderRadius: '50%', padding: 2 }}>
                    <g>
                        <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.2 3.23l6.9-6.9C35.64 1.98 30.13 0 24 0 14.82 0 6.73 5.82 2.69 14.09l8.06 6.26C12.5 13.98 17.77 9.5 24 9.5z" />
                        <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.64 7.01l7.19 5.6C43.98 37.13 46.1 31.3 46.1 24.55z" />
                        <path fill="#FBBC05" d="M10.75 28.35c-1.01-2.98-1.01-6.18 0-9.16l-8.06-6.26C.7 17.18 0 20.5 0 24c0 3.5.7 6.82 1.94 9.93l8.81-5.58z" />
                        <path fill="#EA4335" d="M24 48c6.13 0 11.64-2.02 15.57-5.5l-7.19-5.6c-2.01 1.35-4.59 2.15-8.38 2.15-6.23 0-11.5-4.48-13.25-10.5l-8.81 5.58C6.73 42.18 14.82 48 24 48z" />
                        <path fill="none" d="M0 0h48v48H0z" />
                    </g>
                </svg>
                Sign in with Google
            </button>
        </div>
    );
};

export default Auth;