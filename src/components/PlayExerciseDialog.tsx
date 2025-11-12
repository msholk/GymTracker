
import React, { useState } from 'react';
import { ExerciseHistoryRecord } from '../data/exerciseHistory';

import type { SetItem, ExerciseProps } from '../types/exercise';
import { renderSetInputs } from './SetInputs/renderSetInputs';
import { LatestHistory } from './LatestHistory';
interface PlaySetItem extends SetItem {
    completed?: boolean;
}

interface PlayExerciseDialogProps {
    open: boolean;
    exercise?: ExerciseProps | null | undefined;
    latestHistory?: ExerciseHistoryRecord | null | undefined;
    onSave: (historyRecord: ExerciseHistoryRecord) => void;
    onDelete: () => void;
    onClose: () => void;
}

const PlayExerciseDialog: React.FC<PlayExerciseDialogProps> = (

    { open, exercise, latestHistory, onSave, onClose }) => {
    const [title, setTitle] = useState(exercise?.title || '');
    // Remove 'completed' property from sets when initializing
    const cleanSets = (exercise?.sets || []).map(s => {
        const { completed, ...rest } = s as any;
        return rest;
    });
    const [sets, setSets] = useState<PlaySetItem[]>(cleanSets);
    const hasReps = exercise?.hasRepetitions ?? true;
    // State for difficulty
    const [difficulty, setDifficulty] = useState(3); // 1-5, default to 3 (Medium)
    // State for saving
    const [isSaving, setIsSaving] = useState(false);

    React.useEffect(() => {
        setTitle(exercise?.title || '');
        // Remove 'completed' property from sets when updating
        const cleanSets = (exercise?.sets || []).map(s => {
            const { completed, ...rest } = s as any;
            return rest;
        });
        setSets(cleanSets);
        setDifficulty(3); // Reset to Medium on open
    }, [exercise]);

    if (!open || !exercise) return null;
    const measurementUnit = exercise.measurementUnit || 'Unit';



    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 320, boxShadow: '0 2px 16px rgba(0,0,0,0.13)', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 18, color: '#4F8A8B' }}>{title}</div>
                {LatestHistory(latestHistory)}


                {/* Sets List */}
                <div style={{ marginTop: 10, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 15, color: '#4F8A8B' }}>Sets</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {renderSetInputs(sets, measurementUnit, setSets, 'play')}
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
                        style={{ background: '#4F8A8B', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 600, fontSize: 15, cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}
                        onClick={async () => {
                            setIsSaving(true);
                            const sanitizedSets = sets.map(set => ({
                                id: set.id,
                                weight: set.weight === undefined ? 0 : set.weight,
                                reps: set.reps === undefined ? 0 : set.reps,
                                time: set.time === undefined ? 0 : set.time,
                                measurementUnit: exercise.measurementUnit,
                                hasRepetitions: !!exercise.hasRepetitions,
                                hasWeight: !!exercise.hasWeight,
                                hasTime: !!exercise.hasTime,
                            }));
                            const historyRecord: ExerciseHistoryRecord = {
                                exerciseId: exercise.id,
                                title,
                                measurementUnit,
                                sets: sanitizedSets,
                                timestamp: new Date().toISOString(),
                                difficulty,
                            };

                            onSave(historyRecord);
                            setIsSaving(false);
                            onClose();
                        }}
                        disabled={!title.trim() || isSaving}
                    >{isSaving ? 'Saving...' : 'Save'}</button>
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
