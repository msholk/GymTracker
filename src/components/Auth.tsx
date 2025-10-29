import React, { useState } from 'react';
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
        <div>
            <h2>Sign In</h2>
            {error && <p>{error}</p>}
            <button onClick={handleGoogleSignIn}>Sign in with Google</button>
        </div>
    );
};

export default Auth;