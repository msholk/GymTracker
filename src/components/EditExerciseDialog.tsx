import React, { useState } from 'react';


type SetItem = {
    id: string;
    value: number;
    type?: 'time' | 'weight';
    reps?: number;
};

type MeasurementUnit = 'None' | 'Kg' | 'Lb' | 'Plate' | 'Hole';
interface EditExerciseDialogProps {
    open: boolean;
    exercise: {
        id: string;
        title: string;
        measurement?: 'Time' | 'Weight' | 'Body Weight';
        hasRepetitions?: boolean;
        sets?: SetItem[];
        measurementUnit?: MeasurementUnit;
    } | null;
    onSave: (updated: { id: string; title: string; measurement?: 'Time' | 'Weight' | 'Body Weight'; sets?: SetItem[]; measurementUnit?: MeasurementUnit }) => void;
    onDelete: () => void;
    onClose: () => void;
}


const EditExerciseDialog: React.FC<EditExerciseDialogProps> = ({ open, exercise, onSave, onDelete, onClose }) => {
    const [title, setTitle] = useState(exercise?.title || '');
    const [measurement, setMeasurement] = useState<"Time" | "Weight" | "Body Weight" | undefined>(exercise?.measurement);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [sets, setSets] = useState<SetItem[]>(exercise?.sets || []);
    const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>(exercise?.measurementUnit || 'None');
    const hasReps = exercise?.hasRepetitions ?? true;

    React.useEffect(() => {
        setTitle(exercise?.title || '');
        setMeasurement(exercise?.measurement);
        setSets(exercise?.sets || []);
        setMeasurementUnit(exercise?.measurementUnit || 'None');
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
                <div style={{ marginBottom: 8 }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Measurement Unit</label>
                    <select
                        value={measurementUnit}
                        onChange={e => setMeasurementUnit(e.target.value as MeasurementUnit)}
                        style={{ fontSize: 15, padding: '7px 10px', borderRadius: 8, border: '1px solid #ccc', width: '100%' }}
                    >
                        <option value="None">None</option>
                        <option value="Kg">Kg</option>
                        <option value="Lb">Lb</option>
                        <option value="Plate">Plate</option>
                        <option value="Hole">Hole</option>
                    </select>
                </div>
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

                {/* Sets List */}
                <div style={{ marginTop: 10, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 15, color: '#4F8A8B' }}>Sets</span>
                        <button
                            type="button"
                            style={{ background: '#4F8A8B', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, cursor: 'pointer' }}
                            onClick={() => {
                                let defaultValue = 1;
                                let type: 'time' | 'weight' = 'weight';
                                if (measurement === 'Time') {
                                    defaultValue = 0;
                                    type = 'time';
                                } else if (measurement === 'Weight' || measurement === 'Body Weight') {
                                    defaultValue = 10;
                                    type = 'weight';
                                }
                                setSets([
                                    ...sets,
                                    {
                                        id: Math.random().toString(36).substr(2, 9),
                                        value: defaultValue,
                                        type,
                                        reps: hasReps ? 10 : undefined
                                    }
                                ]);
                            }}
                            aria-label="Add Set"
                        >
                            +
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {sets.length === 0 ? (
                            <span style={{ color: '#aaa', fontSize: 14 }}>No sets</span>
                        ) : (
                            sets.map((set, idx) => {
                                let label = '';
                                let step = 1;
                                let min = 0;
                                if (set.type === 'time' || measurement === 'Time') {
                                    label = 'time:';
                                    min = 0;
                                    step = hasReps ? 0.5 : 1;
                                } else {
                                    label = 'weight:';
                                    min = 0;
                                    step = hasReps ? 0.5 : 1;
                                }
                                return (
                                    <div key={set.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 15, color: '#333' }}>Set {idx + 1}:</span>
                                        <span style={{ color: '#888', fontSize: 14 }}>{label}</span>
                                        <input
                                            type="number"
                                            value={set.value}
                                            min={min}
                                            step={step}
                                            onChange={e => {
                                                const val = parseFloat(e.target.value) || 0;
                                                setSets(sets => sets.map((s, i) => i === idx ? { ...s, value: val } : s));
                                            }}
                                            style={{ width: 60, fontSize: 15, padding: '4px 8px', borderRadius: 6, border: '1px solid #ccc' }}
                                        />
                                        {hasReps && (
                                            <>
                                                <span style={{ color: '#888', fontSize: 14 }}>reps:</span>
                                                <input
                                                    type="number"
                                                    value={set.reps ?? 1}
                                                    min={1}
                                                    step={1}
                                                    onChange={e => {
                                                        const val = parseInt(e.target.value, 10) || 1;
                                                        setSets(sets => sets.map((s, i) => i === idx ? { ...s, reps: val } : s));
                                                    }}
                                                    style={{ width: 50, fontSize: 15, padding: '4px 8px', borderRadius: 6, border: '1px solid #ccc' }}
                                                />
                                            </>
                                        )}
                                        <button
                                            type="button"
                                            style={{ background: '#eee', color: '#d32f2f', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                                            onClick={() => setSets(sets => sets.filter((_, i) => i !== idx))}
                                            aria-label="Remove Set"
                                        >
                                            &minus;
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
                    <button
                        style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                        onClick={() => setShowDeleteConfirm(true)}
                    >Delete</button>
                    <button
                        style={{ background: '#4F8A8B', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                        onClick={() => onSave({ id: exercise.id, title, measurement, sets, measurementUnit })}
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
