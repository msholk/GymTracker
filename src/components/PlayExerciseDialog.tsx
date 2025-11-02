
import React, { useState } from 'react';
import { saveExerciseHistory } from '../data/exerciseHistory';


type SetItem = {
    id: string;
    value: number;
    type?: 'time' | 'weight';
    reps?: number;
};

type MeasurementUnit = 'None' | 'Kg' | 'Lb' | 'Plate' | 'Hole';
interface PlayExerciseDialogProps {
    open: boolean;
    exercise: {
        id: string;
        title: string;
        measurement?: 'Time' | 'Weight' | 'Body Weight';
        hasRepetitions?: boolean;
        sets?: SetItem[];
        measurementUnit?: MeasurementUnit;
    } | null;
    latestHistory?: {
        sets: SetItem[];
        timestamp: number;
    } | null;
    onSave: (updated: { id: string; title: string; measurement?: 'Time' | 'Weight' | 'Body Weight'; sets?: SetItem[]; measurementUnit?: MeasurementUnit }) => void;
    onDelete: () => void;
    onClose: () => void;
}


const PlayExerciseDialog: React.FC<PlayExerciseDialogProps> = ({ open, exercise, latestHistory, onSave, onDelete, onClose }) => {
    function renderSetInputs(sets: SetItem[], measurement: string | undefined, measurementUnit: MeasurementUnit, hasReps: boolean, setSets: React.Dispatch<React.SetStateAction<SetItem[]>>) {
        if (sets.length === 0) {
            return <span style={{ color: '#aaa', fontSize: 14 }}>No sets</span>;
        }
        function getInputs({ set, idx, measurement, measurementUnit, label }:
            {
                set: SetItem;
                idx: number;
                measurement: string | undefined;
                measurementUnit: MeasurementUnit;
                label: string;
            },) {
            const style = { width: 60, fontSize: 15, padding: '4px 8px', borderRadius: 6, border: '1px solid #ccc' };
            if (set.completed) {
                // Render as label if completed
                return (
                    <>
                        <span style={{ color: '#888', fontSize: 14 }}>{label}</span>
                        <span style={{ color: '#333', fontSize: 15, marginRight: 8 }}>{set.value}</span>
                        {hasReps && <><span style={{ color: '#888', fontSize: 14 }}>reps:</span> <span style={{ color: '#333', fontSize: 15 }}>{set.reps}</span></>}
                    </>
                );
            }
            let firstInput = null;
            if (measurement === 'Time' || measurement === 'Weight') {
                let lblCtrl = <span style={{ color: '#888', fontSize: 14 }}>{label}</span>
                let step = 0.5
                if (measurement === 'Time') {
                    lblCtrl = <span style={{ color: '#888', fontSize: 14 }}>secs</span>
                    step = 1
                }
                else if (label.includes('Plate') || label.includes('Hole')) {
                    step = 1
                }
                firstInput = (
                    <>
                        {lblCtrl}
                        <input
                            type="number"
                            value={set.value}
                            min={0}
                            step={step}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setSets(sets => sets.map((s, i) => i === idx ? { ...s, value: val } : s));
                            }}
                            style={style}
                        />
                    </>
                );
            }

            let repsInput = null;
            if (hasReps) {
                repsInput = (
                    <>
                        <span style={{ color: '#888', fontSize: 14 }}>reps:</span>
                        <input
                            type="number"
                            value={set.reps}
                            min={1}
                            step={1}
                            onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 1;
                                setSets(sets => sets.map((s, i) => i === idx ? { ...s, reps: val } : s));
                            }}
                            style={style}
                        />
                    </>
                );
            }

            return (
                <>
                    {firstInput}
                    {repsInput}
                </>
            )
        }
        return sets.map((set, idx) => {
            const { label, step, min } = getSetInputProps(set, measurement, measurementUnit, hasReps);
            return (
                <div key={set.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, color: '#333' }}>Set {idx + 1}:</span>
                    {getInputs({ set, idx, measurement, measurementUnit, label })}

                    <button
                        type="button"
                        style={{
                            background: set.completed ? '#e0f2f1' : '#ffe082', // yellow for uncompleted
                            color: set.completed ? '#388e3c' : '#e65100', // deep orange for uncompleted
                            border: 'none',
                            borderRadius: '50%',
                            width: 22,
                            height: 22,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: set.completed ? '0 0 0 2px #b2dfdb' : '0 0 0 2px #ffe082'
                        }}
                        onClick={() => setSets(sets => sets.map((s, i) => i === idx ? { ...s, completed: !s.completed } : s))}
                        aria-label={set.completed ? 'Unmark as Completed' : 'Mark as Completed'}
                        title={set.completed ? 'Unmark as Completed' : 'Mark as Completed'}
                    >
                        {set.completed ? '✓' : '▶'}
                    </button>
                </div>
            );
        });
    }
    function getSetInputProps(set: SetItem, measurement: string | undefined, measurementUnit: MeasurementUnit, hasReps: boolean) {
        let label = '';
        let step = 1;
        let min = 0;
        if (set.type === 'time' || measurement === 'Time') {
            label = 'time:';
            min = 0;
            step = hasReps ? 0.5 : 1;
        } else if (measurementUnit && measurementUnit !== 'None') {
            label = `${measurementUnit}:`;
            min = 0;
            step = hasReps ? 0.5 : 1;
        } else {
            label = 'weight:';
            min = 0;
            step = hasReps ? 0.5 : 1;
        }
        return { label, step, min };
    }
    const [title, setTitle] = useState(exercise?.title || '');
    const [measurement, setMeasurement] = useState<"Time" | "Weight" | "Body Weight" | undefined>(exercise?.measurement);
    // Remove 'completed' property from sets when initializing
    const cleanSets = (exercise?.sets || []).map(s => {
        const { completed, ...rest } = s as any;
        return rest;
    });
    const [sets, setSets] = useState<SetItem[]>(cleanSets);
    const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>(exercise?.measurementUnit || 'None');
    const hasReps = exercise?.hasRepetitions ?? true;
    // State for difficulty
    const [difficulty, setDifficulty] = useState(3); // 1-5, default to 3 (Medium)

    React.useEffect(() => {
        setTitle(exercise?.title || '');
        setMeasurement(exercise?.measurement);
        // Remove 'completed' property from sets when updating
        const cleanSets = (exercise?.sets || []).map(s => {
            const { completed, ...rest } = s as any;
            return rest;
        });
        setSets(cleanSets);
        setMeasurementUnit(exercise?.measurementUnit || 'None');
        setDifficulty(3); // Reset to Medium on open
    }, [exercise]);

    if (!open || !exercise) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 320, boxShadow: '0 2px 16px rgba(0,0,0,0.13)', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 18, color: '#4F8A8B' }}>{title}</div>
                {latestHistory && (
                    <div style={{ color: '#4F8A8B', fontSize: 14, fontStyle: 'italic', marginBottom: 6 }}>
                        Last: {latestHistory.sets && latestHistory.sets.length > 0 ? latestHistory.sets.map(s => `${s.value}${s.reps ? ` x${s.reps}` : ''}`).join(', ') : 'No sets'}
                        {latestHistory.timestamp && (
                            <span style={{ color: '#888', marginLeft: 6 }}>
                                ({new Date(latestHistory.timestamp).toLocaleDateString('en-GB')})
                            </span>
                        )} Difficulty: {latestHistory.difficulty}
                    </div>
                )}


                {/* Sets List */}
                <div style={{ marginTop: 10, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 15, color: '#4F8A8B' }}>Sets</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {renderSetInputs(sets, measurement, measurementUnit, hasReps, setSets)}
                    </div>
                </div>

                {/* Difficulty select */}
                <div style={{ marginBottom: 10 }}>
                    <label style={{ fontWeight: 600, fontSize: 15, color: '#4F8A8B', marginRight: 8 }}>How hard was it?</label>
                    <select
                        value={difficulty}
                        onChange={e => setDifficulty(Number(e.target.value))}
                        style={{ fontSize: 15, padding: '7px 10px', borderRadius: 8, border: '1px solid #ccc', minWidth: 120 }}
                    >
                        <option value={1}>Don't feel I have trained</option>
                        <option value={2}>It was easy</option>
                        <option value={3}>It was okay</option>
                        <option value={4}>I have made an effort</option>
                        <option value={5}>Almost impossible</option>
                    </select>
                </div>


                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
                    <button
                        style={{ background: '#4F8A8B', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                        onClick={async () => {
                            const sanitizedSets = sets.map(set => ({ ...set, reps: set.reps === undefined ? 0 : set.reps }));
                            const historyData = {
                                exerciseId: exercise.id,
                                title,
                                measurement,
                                measurementUnit,
                                sets: sanitizedSets,
                                timestamp: Date.now(),
                                difficulty,
                            };
                            await saveExerciseHistory(historyData);
                            onSave({ id: exercise.id, title, measurement, sets: sanitizedSets, measurementUnit });
                        }}
                        disabled={!title.trim()}
                    >Save</button>
                    <button
                        style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                        onClick={onClose}
                    >Close</button>
                </div>
            </div>
            {/* Delete confirmation dialog */}
        </div>
    );
};

export default PlayExerciseDialog;
