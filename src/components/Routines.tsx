import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import useAuth from '../hooks/useAuth';


interface Routine {
    id: string;
    title: string;
    createdAt: Date;
    isEditing: boolean;
    uid: string;
}

const Routines: React.FC = () => {
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchRoutines = async () => {
            setLoading(true);
            const q = query(
                collection(db, 'routines'),
                where('uid', '==', user.uid),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            setRoutines(snapshot.docs.map(docSnap => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    title: data.title,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
                    isEditing: false,
                    uid: data.uid
                };
            }));
            setLoading(false);
        };
        fetchRoutines();
    }, [user]);

    const addRoutine = async () => {
        if (!user) return;
        const docRef = await addDoc(collection(db, 'routines'), {
            title: '',
            createdAt: serverTimestamp(),
            uid: user.uid
        });
        setRoutines(routines => [
            {
                id: docRef.id,
                title: '',
                createdAt: new Date(),
                isEditing: true,
                uid: user.uid
            },
            ...routines
        ]);
    };

    const updateRoutineTitle = async (id: string, title: string) => {
        setRoutines(routines => routines.map(r => r.id === id ? { ...r, title } : r));
        await updateDoc(doc(db, 'routines', id), { title });
    };

    const finishEditing = (id: string) => {
        setRoutines(routines => routines.map(r => r.id === id ? { ...r, isEditing: false } : r));
    };

    const deleteRoutine = async (id: string) => {
        await deleteDoc(doc(db, 'routines', id));
        setRoutines(routines => routines.filter(r => r.id !== id));
        setConfirmDeleteId(null);
    };

    return (
        <div style={{ margin: '32px auto', maxWidth: 500, background: '#f4f6f8', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h2 style={{ color: '#4F8A8B', fontWeight: 700, margin: 0 }}>Routines</h2>
                <button
                    onClick={addRoutine}
                    style={{
                        background: '#4F8A8B',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: 44,
                        height: 44,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 28,
                        fontWeight: 700,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                    }}
                    aria-label="Add New Routine"
                    onMouseOver={e => (e.currentTarget.style.background = '#357376')}
                    onMouseOut={e => (e.currentTarget.style.background = '#4F8A8B')}
                >
                    <span style={{ fontSize: 32, lineHeight: 1, marginTop: -2 }}>+</span>
                </button>
            </div>
            {loading ? <p style={{ color: '#888', marginBottom: 24, textAlign: 'center' }}>Loading routines...</p> : null}
            {!loading && routines.length === 0 && <p style={{ color: '#666', marginBottom: 24, textAlign: 'center' }}>You have no routines yet.</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {routines.map(routine => (
                    <div
                        key={routine.id}
                        style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'left', cursor: routine.isEditing ? 'default' : 'pointer', transition: 'background 0.15s' }}
                        onClick={() => !routine.isEditing && setRoutines(routines => routines.map(r => r.id === routine.id ? { ...r, isEditing: true } : r))}
                    >
                        {routine.isEditing ? (
                            <>
                                <input
                                    type="text"
                                    value={routine.title}
                                    onChange={e => updateRoutineTitle(routine.id, e.target.value)}
                                    placeholder="Routine title"
                                    style={{ fontSize: 18, padding: '8px 12px', borderRadius: 8, border: '1px solid #ccc', width: '100%', marginBottom: 12, boxSizing: 'border-box' }}
                                    autoFocus
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                                    <span style={{ color: '#888', fontSize: 14 }}>Created: {routine.createdAt.toLocaleString()}</span>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            style={{ background: '#4F8A8B', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                                            onClick={e => { e.stopPropagation(); finishEditing(routine.id); }}
                                        >Save</button>
                                        <button
                                            style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                                            onClick={e => { e.stopPropagation(); setConfirmDeleteId(routine.id); }}
                                        >Delete</button>
            {confirmDeleteId && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 320, boxShadow: '0 4px 24px rgba(0,0,0,0.18)', textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 18, color: '#d32f2f' }}>Delete Routine?</div>
                        <div style={{ color: '#555', marginBottom: 28 }}>Are you sure you want to delete this routine? This action cannot be undone.</div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 18 }}>
                            <button
                                style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
                                onClick={() => deleteRoutine(confirmDeleteId)}
                            >Delete</button>
                            <button
                                style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
                                onClick={() => setConfirmDeleteId(null)}
                            >Cancel</button>
                        </div>
                    </div>
                </div>
            )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ fontSize: 20, fontWeight: 600, color: '#333', marginBottom: 8 }}>{routine.title}</div>
                                <div style={{ color: '#888', fontSize: 14 }}>Created: {routine.createdAt.toLocaleString()}</div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Routines;
