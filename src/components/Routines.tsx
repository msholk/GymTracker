// ...existing code...
import React, { useState, useEffect } from 'react';
import EditExerciseDialog from './EditExerciseDialog';
import NewExerciseEditor from './NewExerciseEditor';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import useAuth from '../hooks/useAuth';


interface SetItem {
    id: string;
    value: number;
}
interface Exercise {
    id: string;
    title: string;
    measurement?: 'Time' | 'Weight' | 'Body Weight';
    hasRepetitions?: boolean;
    sets?: SetItem[];
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
    // UI state for editing
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Routine selection and editing
    // Exercise edit dialog state
    const [exerciseDialog, setExerciseDialog] = useState<{
        routineId: string;
        exerciseIdx: number;
    } | null>(null);

    const [routines, setRoutines] = useState<Routine[]>([]);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    // Add state for showing NewExerciseEditor modal
    const [showAddExerciseFor, setShowAddExerciseFor] = useState<string | null>(null);

    const selectRoutine = (routine: Routine) => {
        setSelectedId(routine.id);
    };

    const updateRoutineTitle = async (id: string, title: string) => {
        await updateDoc(doc(db, 'routines', id), { title });
        setRoutines(routines => routines.map(r => r.id === id ? { ...r, title } : r));
    };

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



    // Add new exercise from NewExerciseEditor
    const addExerciseFromEditor = async (routineId: string, ex: { name: string; measurement: 'Time' | 'Weight' | 'Body Weight'; hasRepetitions: boolean }) => {
        const newExercise: Exercise = {
            id: Math.random().toString(36).substr(2, 9),
            title: ex.name,
            measurement: ex.measurement,
            hasRepetitions: ex.hasRepetitions
        };
        setRoutines(routines => routines.map(r => {
            if (r.id === routineId) {
                const updatedExercises = r.exercises ? [...r.exercises, newExercise] : [newExercise];
                updateDoc(doc(db, 'routines', routineId), { exercises: updatedExercises });
                return { ...r, exercises: updatedExercises };
            }
            return r;
        }));
    };

    const finishEditing = async (id: string) => {
        await updateRoutineTitle(id, editTitle);
        setEditingId(null);
        setEditTitle('');
        setSelectedId(null);
    };

    const cancelEditing = (routine: Routine) => {
        setEditingId(null);
        setEditTitle('');
        setSelectedId(routine.id); // Stay in details mode for this routine
    };




    const deleteRoutine = async (id: string) => {
        await deleteDoc(doc(db, 'routines', id));
        setRoutines(routines => routines.filter(r => r.id !== id));
        setConfirmDeleteId(null);
        setEditingId(null);
        setEditTitle('');
        setSelectedId(null);
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
                            cursor: editingId === routine.id ? undefined : 'pointer',
                            transition: 'box-shadow 0.2s',
                        }}
                        onClick={editingId === routine.id ? undefined : () => selectRoutine(routine)}
                        onMouseOver={e => {
                            if (editingId !== routine.id) e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,138,139,0.13)';
                        }}
                        onMouseOut={e => {
                            if (editingId !== routine.id) e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
                        }}
                    >
                        {editingId === routine.id ? (
                            <>
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={e => setEditTitle(e.target.value)}
                                    placeholder="Routine title"
                                    style={{ fontSize: 18, padding: '8px 12px', borderRadius: 8, border: '1px solid #ccc', width: '100%', marginBottom: 12, boxSizing: 'border-box' }}
                                    autoFocus
                                    onClick={e => e.stopPropagation()}
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
                                        <button
                                            style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                                            onClick={e => { e.stopPropagation(); cancelEditing(routine); }}
                                        >Cancel</button>
                                    </div>
                                </div>
                                {/* Exercises Section */}
                                <div style={{ marginTop: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                                        <span style={{ fontWeight: 600, fontSize: 17, color: '#4F8A8B' }}>Exercises</span>
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
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                    {selectedId === routine.id && editingId !== routine.id && (
                                        <button
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                marginRight: 10,
                                                cursor: 'pointer',
                                                fontSize: 22,
                                                color: '#888',
                                                padding: 2,
                                                borderRadius: 6,
                                                transition: 'background 0.2s',
                                            }}
                                            aria-label="Back to List"
                                            onClick={e => { e.stopPropagation(); setSelectedId(null); }}
                                            onMouseOver={e => (e.currentTarget.style.background = '#f4f6f8')}
                                            onMouseOut={e => (e.currentTarget.style.background = 'none')}
                                        >
                                            &#8592;
                                        </button>
                                    )}
                                    <span style={{ fontSize: 20, fontWeight: 600, color: '#333' }}>{routine.title}</span>
                                    {selectedId === routine.id && (
                                        <button
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                marginLeft: 8,
                                                cursor: 'pointer',
                                                fontSize: 22,
                                                color: '#888',
                                                padding: 2,
                                                borderRadius: 6,
                                                transition: 'background 0.2s',
                                            }}
                                            aria-label="Edit Routine Title"
                                            onClick={e => { e.stopPropagation(); setEditingId(routine.id); setEditTitle(routine.title); }}
                                            onMouseOver={e => (e.currentTarget.style.background = '#f4f6f8')}
                                            onMouseOut={e => (e.currentTarget.style.background = 'none')}
                                        >
                                            &#8942;
                                        </button>
                                    )}
                                </div>
                                <div style={{ color: '#888', fontSize: 14 }}>Created: {routine.createdAt.toLocaleString()}</div>
                                {/* Exercises list only in details mode */}
                                {selectedId === routine.id && editingId !== routine.id && (
                                    <div style={{ marginTop: 16 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6, justifyContent: 'space-between' }}>
                                            <span style={{ fontWeight: 600, fontSize: 15, color: '#4F8A8B' }}>Exercises:</span>
                                            <button
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
                                                onClick={e => { e.stopPropagation(); setShowAddExerciseFor(routine.id); }}
                                                onMouseOver={e => (e.currentTarget.style.background = '#357376')}
                                                onMouseOut={e => (e.currentTarget.style.background = '#4F8A8B')}
                                            >
                                                <span style={{ fontSize: 24, lineHeight: 1, marginTop: -2 }}>+</span>
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {(routine.exercises && routine.exercises.length > 0) ? (
                                                routine.exercises.map((ex, idx) => (
                                                    <div
                                                        key={ex.id}
                                                        style={{ display: 'flex', alignItems: 'center', background: '#f4f6f8', borderRadius: 8, padding: '6px 12px', fontSize: 15, color: '#333', cursor: 'grab' }}
                                                        draggable
                                                        onDragStart={e => {
                                                            e.dataTransfer.setData('text/plain', idx.toString());
                                                        }}
                                                        onDragOver={e => e.preventDefault()}
                                                        onDrop={e => {
                                                            e.preventDefault();
                                                            const fromIdx = Number(e.dataTransfer.getData('text/plain'));
                                                            if (fromIdx === idx) return;
                                                            const updatedExercises = [...(routine.exercises || [])];
                                                            const [moved] = updatedExercises.splice(fromIdx, 1);
                                                            updatedExercises.splice(idx, 0, moved);
                                                            setRoutines(routines => routines.map(r =>
                                                                r.id === routine.id ? { ...r, exercises: updatedExercises } : r
                                                            ));
                                                            updateDoc(doc(db, 'routines', routine.id), { exercises: updatedExercises });
                                                        }}
                                                    >
                                                        <span style={{ flex: 1 }}>
                                                            {ex.title || <span style={{ color: '#aaa' }}>Untitled Exercise</span>}
                                                        </span>
                                                        <button
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                fontSize: 20,
                                                                color: '#888',
                                                                padding: 2,
                                                                borderRadius: 6,
                                                                marginLeft: 8,
                                                                transition: 'background 0.2s',
                                                            }}
                                                            aria-label="Edit Exercise"
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                setExerciseDialog({ routineId: routine.id, exerciseIdx: idx });
                                                            }}
                                                            onMouseOver={e => (e.currentTarget.style.background = '#e0e0e0')}
                                                            onMouseOut={e => (e.currentTarget.style.background = 'none')}
                                                        >
                                                            &#8942;
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{ color: '#aaa', fontSize: 14 }}>No exercises</div>
                                            )}
                                        </div>
                                        {/* Modal for NewExerciseEditor */}
                                        {showAddExerciseFor === routine.id && (
                                            <NewExerciseEditor
                                                onSelect={ex => { addExerciseFromEditor(routine.id, ex); setShowAddExerciseFor(null); }}
                                                onClose={() => setShowAddExerciseFor(null)}
                                            />
                                        )}
                                    </div>
                                    // Add state for showing NewExerciseEditor modal
                                )}
                                {/* No edit hint in details mode */}
                            </>
                        )}
                    </div>
                ))}
            </div>
            {/* Exercise Edit Dialog/Modal */}
            <EditExerciseDialog
                open={!!exerciseDialog}
                exercise={(() => {
                    if (!exerciseDialog) return null;
                    const routine = routines.find(r => r.id === exerciseDialog.routineId);
                    if (!routine) return null;
                    return routine.exercises?.[exerciseDialog.exerciseIdx] || null;
                })()}
                onSave={updated => {
                    if (!exerciseDialog) return;
                    setRoutines(routines => routines.map(r => {
                        if (r.id !== exerciseDialog.routineId) return r;
                        const exercises = r.exercises ? [...r.exercises] : [];
                        exercises[exerciseDialog.exerciseIdx] = { ...exercises[exerciseDialog.exerciseIdx], ...updated };
                        updateDoc(doc(db, 'routines', r.id), { exercises });
                        return { ...r, exercises };
                    }));
                    setExerciseDialog(null);
                }}
                onDelete={() => {
                    if (!exerciseDialog) return;
                    setRoutines(routines => routines.map(r => {
                        if (r.id !== exerciseDialog.routineId) return r;
                        const exercises = (r.exercises || []).filter((_, i) => i !== exerciseDialog.exerciseIdx);
                        updateDoc(doc(db, 'routines', r.id), { exercises });
                        return { ...r, exercises };
                    }));
                    setExerciseDialog(null);
                }}
                onClose={() => setExerciseDialog(null)}
            />
        </div>
    );
}
export default Routines;
