import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import useAuth from '../hooks/useAuth';


interface Exercise {
    id: string;
    title: string;
}

interface Routine {
    id: string;
    title: string;
    createdAt: Date;
    isEditing: boolean;
    uid: string;
    exercises?: Exercise[];
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
                    uid: data.uid,
                    exercises: data.exercises || []
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
            uid: user.uid,
            exercises: []
        });
        setRoutines(routines => [
            {
                id: docRef.id,
                title: '',
                createdAt: new Date(),
                isEditing: true,
                uid: user.uid,
                exercises: []
            },
            ...routines
        ]);
    };
    const addExercise = async (routineId: string) => {
        setRoutines(routines => routines.map(r => {
            if (r.id === routineId) {
                const newExercise: Exercise = {
                    id: Math.random().toString(36).substr(2, 9),
                    title: ''
                };
                const updatedExercises = r.exercises ? [...r.exercises, newExercise] : [newExercise];
                // Optionally update Firestore here if you want exercises to persist
                updateDoc(doc(db, 'routines', routineId), { exercises: updatedExercises });
                return { ...r, exercises: updatedExercises };
            }
            return r;
        }));
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
                        style={{
                            background: '#fff',
                            borderRadius: 12,
                            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                            padding: 20,
                            position: 'relative',
                            cursor: !routine.isEditing ? 'pointer' : undefined,
                            transition: 'box-shadow 0.2s',
                        }}
                        onClick={!routine.isEditing ? () => setRoutines(rs => rs.map(r => r.id === routine.id ? { ...r, isEditing: true } : { ...r, isEditing: false })) : undefined}
                        onMouseOver={e => {
                            if (!routine.isEditing) e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,138,139,0.13)';
                        }}
                        onMouseOut={e => {
                            if (!routine.isEditing) e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
                        }}
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
                                    </div>
                                </div>
                                {/* Exercises Section */}
                                <div style={{ marginTop: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <span style={{ fontWeight: 600, fontSize: 17, color: '#4F8A8B' }}>Exercises</span>
                                        <button
                                            onClick={() => addExercise(routine.id)}
                                            style={{
                                                background: '#4F8A8B',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: 32,
                                                height: 32,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 22,
                                                fontWeight: 700,
                                                boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                                                cursor: 'pointer',
                                                transition: 'background 0.2s',
                                            }}
                                            aria-label="Add Exercise"
                                            onMouseOver={e => (e.currentTarget.style.background = '#357376')}
                                            onMouseOut={e => (e.currentTarget.style.background = '#4F8A8B')}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {(routine.exercises || []).map(ex => (
                                            <div key={ex.id} style={{ background: '#f4f6f8', borderRadius: 8, padding: '8px 14px', fontSize: 16, color: '#333' }}>{ex.title || <span style={{ color: '#aaa' }}>Untitled Exercise</span>}</div>
                                        ))}
                                    </div>
                                </div>
                                {/* Confirmation dialog for delete */}
                                {confirmDeleteId === routine.id && (
                                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ background: '#fff', borderRadius: 12, padding: 36, minWidth: 320, boxShadow: '0 2px 16px rgba(0,0,0,0.13)' }}>
                                            <div style={{ fontWeight: 700, fontSize: 20, color: '#d32f2f', marginBottom: 12 }}>Delete Routine?</div>
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
}

export default Routines;
