// ...existing code...
import React, { useState, useEffect, useRef } from 'react';
import type { ExerciseProps } from '../types/exercise';
import { formatSetsShort } from '../utils/formatSetsShort';

// Simple menu component for exercise actions
// (Keep outside, but use only inside Routines)
const ExerciseMenu = (
    { anchorRef, open, onClose, onPlay, onEdit, onHistory }:
        {
            anchorRef: React.RefObject<HTMLButtonElement>,
            open: boolean,
            onClose: () => void,
            onPlay: () => void,
            onEdit: () => void,
            onHistory: () => void
        }) => {
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (anchorRef.current && !anchorRef.current.contains(event.target as Node)) {
                onClose();
            }
        }
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open, anchorRef, onClose]);
    if (!open) return null;
    return (
        <div style={{ position: 'absolute', right: 0, top: 32, background: '#fff', border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.13)', zIndex: 10, minWidth: 100 }}>
            <button
                style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: '10px 18px', textAlign: 'left', cursor: 'pointer', fontSize: 15 }}
                onClick={onPlay}
            >Play</button>
            <button
                style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: '10px 18px', textAlign: 'left', cursor: 'pointer', fontSize: 15 }}
                onClick={onEdit}
            >Edit</button>
            <hr></hr>
            <button
                style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: '10px 18px', textAlign: 'left', cursor: 'pointer', fontSize: 15 }}
                onClick={onHistory}
            >History</button>
        </div>
    );
};
import EditExerciseDialog from './EditExerciseDialog';
import PlayExerciseDialog from './PlayExerciseDialog';
import ExerciseHistoryDialog from './ExerciseHistoryDialog';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import useAuth from '../hooks/useAuth';
import { getExerciseHistory, ExerciseHistoryRecord } from '../data/exerciseHistory';




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
    measurementUnit?: 'None' | 'Kg' | 'Lb' | 'Plate' | 'Hole';
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
    const { user } = useAuth();
    // State for exercise history
    const [exerciseHistory, setExerciseHistory] = useState<ExerciseHistoryRecord[]>([]);
    useEffect(() => {
        if (!user) return;
        getExerciseHistory(user.uid).then(setExerciseHistory);
    }, [user]);
    // UI state for editing
    // State for which exercise menu is open: { routineId, exerciseIdx } | null
    const [exerciseMenu, setExerciseMenu] = useState<{ routineId: string, exerciseIdx: number } | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Routine selection and editing
    // Exercise edit dialog state
    const [exerciseDialog, setExerciseDialog] = useState<{
        routineId: string;
        exerciseIdx: number;
        exercise: Exercise;
    } | null>(null);
    const [exercisePlayDialog, setExercisePlayDialog] = useState<{
        routineId: string;
        exerciseIdx: number;
        exerciseId: string;
    } | null>(null);
    const [exerciseHistoryDialog, setExerciseHistoryDialog] = useState<{
        routineId: string;
        exerciseIdx: number;
    } | null>(null);

    const [routines, setRoutines] = useState<Routine[]>([]);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    // Add state for showing NewExerciseEditor modal
    const [showAddExerciseFor, setShowAddExerciseFor] = useState<{
        routineId: string;
    } | null>(null);

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

    const duplicateRoutine = async (id: string) => {
        const routine = routines.find(r => r.id === id);
        if (!routine) return;
        setEditingId(null);

        const newRoutine = {
            title: routine.title + ' (Copy)',
            createdAt: serverTimestamp(),
            uid: routine.uid,
            exercises: routine.exercises ? routine.exercises.map(ex => ({
                ...ex,
                id: Math.random().toString(36).substr(2, 9), // new id for each exercise
                sets: ex.sets ? ex.sets.map(set => ({
                    ...set,
                    id: Math.random().toString(36).substr(2, 9) // new id for each set
                })) : undefined
            })) : []
        };
        const docRef = await addDoc(collection(db, 'routines'), newRoutine);
        setRoutines(routines => [
            {
                ...newRoutine,
                id: docRef.id,
                createdAt: new Date(),
                isEditing: true
            },
            ...routines
        ]);
        setEditingId(docRef.id);
        setEditTitle(newRoutine.title);
        setSelectedId(docRef.id);
    }

    const Routinesheader = (
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
    )

    interface RoutineHeaderInEditProps {
        routine: Routine;
        confirmDeleteId: string | null;
    }

    const RoutineHeaderInEdit: React.FC<RoutineHeaderInEditProps> = ({ routine, confirmDeleteId }) => {
        return (
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
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            style={{ background: '#4F8A8B', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                            onClick={e => { e.stopPropagation(); finishEditing(routine.id); }}
                        >Save</button>
                        <button
                            style={{ background: '#4F8A8B', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                            onClick={e => { e.stopPropagation(); duplicateRoutine(routine.id); }}
                        >Duplicate</button>
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
                        {(routine.exercises || []).map((ex: Exercise) => (
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
        )
    }
    interface RoutineHeaderInReadModeProps {
        routine: Routine;
    }
    const RoutineHeaderInReadMode: React.FC<RoutineHeaderInReadModeProps> = ({ routine }) => {
        return (
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
                    <span style={{ fontSize: 20, fontWeight: 600, color: '#333' }}>{routine.title || 'Untitled Routine'}</span>
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
            </>
        )
    }

    const renderEditExerciseDialog = (exerciseDialog && exerciseDialog.exercise || !!showAddExerciseFor)
    return (
        <div style={{ margin: '32px auto', maxWidth: 500, background: '#f4f6f8', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: 32 }}>
            {Routinesheader}
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
                            <RoutineHeaderInEdit routine={routine} confirmDeleteId={confirmDeleteId} />
                        ) : (
                            <>
                                <RoutineHeaderInReadMode routine={routine} />
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
                                                onClick={e => { e.stopPropagation(); setShowAddExerciseFor({ routineId: routine.id }); }}
                                                onMouseOver={e => (e.currentTarget.style.background = '#357376')}
                                                onMouseOut={e => (e.currentTarget.style.background = '#4F8A8B')}
                                            >
                                                <span style={{ fontSize: 24, lineHeight: 1, marginTop: -2 }}>+</span>
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {(routine.exercises && routine.exercises.length > 0) ? (
                                                routine.exercises.map((ex, idx) => {
                                                    // Use a callback ref to avoid useRef in a loop
                                                    const menuAnchorRefs = (Routines as any)._menuAnchorRefs = (Routines as any)._menuAnchorRefs || {};
                                                    const refKey = `${routine.id}-${idx}`;
                                                    if (!menuAnchorRefs[refKey]) menuAnchorRefs[refKey] = React.createRef();
                                                    const menuAnchorRef = menuAnchorRefs[refKey];
                                                    const isMenuOpen = !!(exerciseMenu && exerciseMenu.routineId === routine.id && exerciseMenu.exerciseIdx === idx);
                                                    // Find latest history for this exercise
                                                    const historyItems = exerciseHistory.filter(h => h.exerciseId === ex.id);
                                                    let latestHistory: ExerciseHistoryRecord | null = null;
                                                    if (historyItems.length > 0) {
                                                        latestHistory = historyItems.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));
                                                    }
                                                    return (
                                                        <div
                                                            key={ex.id}
                                                            style={{ position: 'relative', display: 'flex', alignItems: 'center', background: '#f4f6f8', borderRadius: 8, padding: '6px 12px', fontSize: 15, color: '#333', cursor: 'grab' }}
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
                                                                {/* Show a checkmark if latestHistory is today */}
                                                                {(() => {
                                                                    if (!latestHistory) return null;
                                                                    // Get today's date string (YYYY-MM-DD)
                                                                    const todayStr = new Date().toLocaleDateString('en-GB');
                                                                    const historyDateStr = new Date(latestHistory.timestamp).toLocaleDateString('en-GB');
                                                                    if (historyDateStr === todayStr) {
                                                                        return <span title="Completed today" style={{ color: '#4F8A8B', marginRight: 6, fontSize: 18, verticalAlign: 'middle' }}>✔️</span>;
                                                                    }
                                                                    return null;
                                                                })()}
                                                                {ex.title || <span style={{ color: '#aaa' }}>Untitled Exercise</span>}
                                                                {ex.sets && ex.sets.length > 0 && (
                                                                    <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>
                                                                        {formatSetsShort(ex.sets, ex)}
                                                                    </span>
                                                                )}
                                                                {/* Show latest history if available */}
                                                                {latestHistory && (
                                                                    <div>
                                                                        <span style={{ color: '#4F8A8B', fontSize: 13, marginLeft: 12, fontStyle: 'italic' }}>
                                                                            Last: {formatSetsShort(latestHistory.sets, ex)}
                                                                            {latestHistory.timestamp && (
                                                                                <span style={{ color: '#888', marginLeft: 6 }}>
                                                                                    ({new Date(latestHistory.timestamp).toLocaleDateString('en-GB')})
                                                                                </span>
                                                                            )}
                                                                            {typeof latestHistory.difficulty === 'number' && (
                                                                                <span style={{ marginLeft: 8 }}>
                                                                                    Diff: {latestHistory.difficulty}
                                                                                </span>
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </span>
                                                            <button
                                                                ref={menuAnchorRef}
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
                                                                aria-label="Exercise Menu"
                                                                onClick={e => {
                                                                    e.stopPropagation();
                                                                    setExerciseMenu({ routineId: routine.id, exerciseIdx: idx });
                                                                }}
                                                                onMouseOver={e => (e.currentTarget.style.background = '#e0e0e0')}
                                                                onMouseOut={e => (e.currentTarget.style.background = 'none')}
                                                            >
                                                                &#8942;
                                                            </button>
                                                            <ExerciseMenu
                                                                anchorRef={menuAnchorRef}
                                                                open={isMenuOpen}
                                                                onClose={() => {
                                                                    setTimeout(() => {
                                                                        setExerciseMenu(null)
                                                                    }, 100);
                                                                }}
                                                                // onClose={() => { }}
                                                                onPlay={() => {
                                                                    //setExerciseMenu(null);
                                                                    setTimeout(() => {
                                                                        console.log('Play clicked');
                                                                        // Placeholder for Play action
                                                                        setExercisePlayDialog({ routineId: routine.id, exerciseIdx: idx, exerciseId: ex.id });
                                                                    }, 0);
                                                                }}
                                                                onEdit={() => {
                                                                    // setExerciseMenu(null);
                                                                    setTimeout(() => {
                                                                        console.log('Edit clicked');
                                                                        setExerciseDialog({ routineId: routine.id, exerciseIdx: idx, exercise: ex });
                                                                    }, 0);
                                                                }}
                                                                onHistory={() => {
                                                                    setTimeout(() => {
                                                                        console.log('History clicked');
                                                                        setExerciseHistoryDialog({ routineId: routine.id, exerciseIdx: idx });
                                                                    }, 0);
                                                                }}
                                                            />
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div style={{ color: '#aaa', fontSize: 14 }}>No exercises</div>
                                            )}
                                        </div>

                                    </div>
                                )}

                            </>
                        )}
                    </div>
                ))}
            </div>
            {/* Exercise Edit Dialog/Modal */}
            {renderEditExerciseDialog && (
                <EditExerciseDialog
                    open={true}
                    exercise={exerciseDialog && exerciseDialog.exercise as ExerciseProps}
                    latestHistory={(() => {
                        if (!exerciseDialog) return null;
                        const routine = routines.find(r => r.id === exerciseDialog.routineId);
                        if (!routine) return null;
                        const exercise = routine.exercises?.[exerciseDialog.exerciseIdx];
                        if (!exercise) return null;
                        const historyItems = exerciseHistory.filter(h => h.exerciseId === exercise.id);
                        if (historyItems.length === 0) return null;
                        return historyItems.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));
                    })()}
                    onSave={updated => {
                        if (!exerciseDialog) return;
                        const _routines = routines.map(r => {
                            if (r.id !== exerciseDialog.routineId) return r;
                            const exercises = r.exercises ? [...r.exercises] : [];
                            delete updated.measurement;
                            const newExercises = exercises.map((ex, i) =>
                                i === exerciseDialog.exerciseIdx ? { ...ex, ...updated } : ex
                            );
                            updateDoc(doc(db, 'routines', r.id), { exercises: newExercises });
                            return { ...r, exercises: newExercises };
                        });
                        console.log('Updated routines after exercise edit:', JSON.stringify(_routines, null, 2));
                        setRoutines(() => _routines as Routine[]);
                        setExerciseDialog(null);
                    }}
                    onAddExercise={newExercise => {
                        const _routines = routines.map(r => {
                            if (r.id !== showAddExerciseFor?.routineId) return r;
                            const exercises = r.exercises ? [...r.exercises, newExercise] : [newExercise];
                            updateDoc(doc(db, 'routines', r.id), { exercises });
                            return { ...r, exercises };
                        })
                        setRoutines(() => _routines as Routine[]);
                        setShowAddExerciseFor(null);
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
                    onClose={() => {
                        setExerciseDialog(null)
                        setShowAddExerciseFor(null);
                    }}
                />
            )}
            {!!exercisePlayDialog && (
                <PlayExerciseDialog
                    open={!!exercisePlayDialog}
                    exercise={(() => {
                        if (!exercisePlayDialog) return null;
                        const routine = routines.find(r => r.id === exercisePlayDialog.routineId);
                        if (!routine) return null;
                        return routine.exercises?.[exercisePlayDialog.exerciseIdx] || null;
                    })()}
                    latestHistory={(() => {
                        if (!exercisePlayDialog) return null;
                        const routine = routines.find(r => r.id === exercisePlayDialog.routineId);
                        if (!routine) return null;
                        const exercise = routine.exercises?.[exercisePlayDialog.exerciseIdx];
                        if (!exercise) return null;
                        const historyItems = exerciseHistory.filter(h => h.exerciseId === exercise.id);
                        if (historyItems.length === 0) return null;
                        return historyItems.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));
                    })()}
                    onSave={async updated => {
                        if (!exercisePlayDialog) return;
                        // Refresh exercise history after saving
                        if (user) {
                            const newHistory = await getExerciseHistory(user.uid);
                            setExerciseHistory(newHistory);
                        }
                        setExercisePlayDialog(null);
                    }}
                    onDelete={() => { }}
                    onClose={() => setExercisePlayDialog(null)}
                />
            )}

            {/* Exercise History Dialog */}
            {!!exerciseHistoryDialog && (
                <ExerciseHistoryDialog
                    open={!!exerciseHistoryDialog}
                    exerciseTitle={(() => {
                        if (!exerciseHistoryDialog) return '';
                        const routine = routines.find(r => r.id === exerciseHistoryDialog.routineId);
                        if (!routine) return '';
                        const exercise = routine.exercises?.[exerciseHistoryDialog.exerciseIdx];
                        return exercise?.title || '';
                    })()}
                    history={(() => {
                        if (!exerciseHistoryDialog) return [];
                        const routine = routines.find(r => r.id === exerciseHistoryDialog.routineId);
                        if (!routine) return [];
                        const exercise = routine.exercises?.[exerciseHistoryDialog.exerciseIdx];
                        if (!exercise) return [];
                        return exerciseHistory.filter(h => h.exerciseId === exercise.id).sort((a, b) => b.timestamp - a.timestamp);
                    })()}
                    onClose={() => setExerciseHistoryDialog(null)}
                />
            )}

        </div>
    );
}
export default Routines;
