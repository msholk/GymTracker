import React, { useState } from 'react';

interface EditExerciseDialogProps {
    open: boolean;
    exercise: {
        id: string;
        title: string;
        measurement?: 'Time' | 'Weight' | 'Body Weight';
    } | null;
    onSave: (updated: { id: string; title: string; measurement?: 'Time' | 'Weight' | 'Body Weight' }) => void;
    onDelete: () => void;
    onClose: () => void;
}


const EditExerciseDialog: React.FC<EditExerciseDialogProps> = ({ open, exercise, onSave, onDelete, onClose }) => {
    const [title, setTitle] = useState(exercise?.title || '');
    const [measurement, setMeasurement] = useState<"Time" | "Weight" | "Body Weight" | undefined>(exercise?.measurement);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    React.useEffect(() => {
        setTitle(exercise?.title || '');
        setMeasurement(exercise?.measurement);
    }, [exercise]);

    if (!open || !exercise) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 320, boxShadow: '0 2px 16px rgba(0,0,0,0.13)', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 18, color: '#4F8A8B' }}>Edit Exercise</div>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Exercise title"
                    style={{ fontSize: 16, padding: '8px 12px', borderRadius: 8, border: '1px solid #ccc', width: '100%', marginBottom: 8, boxSizing: 'border-box' }}
                    autoFocus
                />
                <select
                    value={measurement || ''}
                    onChange={e => setMeasurement(e.target.value as 'Time' | 'Weight' | 'Body Weight')}
                    style={{ fontSize: 15, padding: '7px 10px', borderRadius: 8, border: '1px solid #ccc', width: '100%' }}
                >
                    <option value="">Select measurement</option>
                    <option value="Time">Time</option>
                    <option value="Weight">Weight</option>
                    <option value="Body Weight">Body Weight</option>
                </select>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
                    <button
                        style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                        onClick={() => setShowDeleteConfirm(true)}
                    >Delete</button>
                    <button
                        style={{ background: '#4F8A8B', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                        onClick={() => onSave({ id: exercise.id, title, measurement })}
                        disabled={!title.trim()}
                    >Save</button>
                    <button
                        style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                        onClick={onClose}
                    >Close</button>
                </div>
            </div>
            {/* Delete confirmation dialog */}
            {showDeleteConfirm && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#fff', borderRadius: 12, padding: 36, minWidth: 320, boxShadow: '0 2px 16px rgba(0,0,0,0.13)' }}>
                        <div style={{ fontWeight: 700, fontSize: 20, color: '#d32f2f', marginBottom: 12 }}>Delete Exercise?</div>
                        <div style={{ color: '#555', marginBottom: 28 }}>Are you sure you want to delete this exercise? This action cannot be undone.</div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 18 }}>
                            <button
                                style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
                                onClick={() => { setShowDeleteConfirm(false); onDelete(); }}
                            >Delete</button>
                            <button
                                style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
                                onClick={() => setShowDeleteConfirm(false)}
                            >Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditExerciseDialog;
