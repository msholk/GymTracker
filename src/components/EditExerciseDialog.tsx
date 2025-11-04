import React, { useState } from 'react';
import type { SetItem, MeasurementUnit, ExerciseProps } from '../types/exercise';
import { ExerciseHistoryRecord } from '../data';
import { renderSetInputs } from './SetInputs/renderSetInputs';
import '../styles.css';
interface EditExerciseDialogProps {
    open: boolean;
    exercise: ExerciseProps | null;
    latestHistory?: ExerciseHistoryRecord | null;
    onSave: (updated: { id: string; title: string; measurement?: 'Time' | 'Weight' | 'Body Weight'; sets?: SetItem[]; measurementUnit?: MeasurementUnit }) => void;
    onAddExercise: (newExercise: ExerciseProps) => void;
    onDelete: () => void;
    onClose: () => void;
}
import { LatestHistory } from './LatestHistory';

const EditExerciseDialog: React.FC<EditExerciseDialogProps> = ({ open, exercise, latestHistory, onSave, onAddExercise, onDelete, onClose }) => {


    const [title, setTitle] = useState(exercise?.title || '');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [sets, setSets] = useState<SetItem[]>(exercise?.sets || []);
    const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>(exercise?.measurementUnit || 'Unit');
    const hasReps = exercise?.hasRepetitions ?? true;
    const [hasRepetitions, setHasRepetitions] = useState<boolean>(exercise?.hasRepetitions ?? true);
    const [hasTime, setHasTime] = useState<boolean>(exercise?.hasTime ?? true);
    const [hasWeight, setHasWeight] = useState<boolean>(exercise?.hasWeight ?? true);

    React.useEffect(() => {
        setTitle(exercise?.title || '');

        setSets(exercise?.sets || []);
        setMeasurementUnit(exercise?.measurementUnit || 'Unit');
    }, [exercise]);

    if (!open) return null;

    const DialogTitle = () => {
        const style = { fontWeight: 700, fontSize: 18, color: '#4F8A8B' };
        if (exercise) {
            return (
                <div style={style}>Edit Exercise</div>
            )
        }
        return (
            <div style={style}>Add New Exercise</div>
        )

    }

    const HasRepetitionsBlock = () => {
        // if (exercise) return null;
        return (
            <div style={{ marginBottom: 5 }}>
                <label style={{ display: 'flex', alignItems: 'center', fontWeight: 600, gap: 8 }}>
                    <input
                        type="checkbox"
                        checked={hasRepetitions}
                        onChange={e => setHasRepetitions(e.target.checked)}
                        style={{ marginRight: 8 }}
                    />
                    Has Repetitions
                </label>
            </div>
        )
    }
    const HasTimeBlock = () => {
        // if (exercise) return null;
        return (
            <div style={{ marginBottom: 5 }}>
                <label style={{ display: 'flex', alignItems: 'center', fontWeight: 600, gap: 8 }}>
                    <input
                        type="checkbox"
                        checked={hasTime}
                        onChange={e => {
                            setHasTime(e.target.checked);
                            sets.forEach((set, idx) => {
                                set.hasTime = Boolean(e.target.checked);
                            })
                            setSets([...sets]);
                        }}
                        style={{ marginRight: 8 }}
                    />
                    Measure Time
                </label>
            </div>
        )
    }
    const HasWeightBlock = () => {
        // if (exercise) return null;
        return (
            <div style={{ marginBottom: 0 }}>
                <label style={{ display: 'flex', alignItems: 'center', fontWeight: 600, gap: 8 }}>
                    <input
                        type="checkbox"
                        checked={hasWeight}
                        onChange={e => {
                            setHasWeight(e.target.checked)
                            sets.forEach((set, idx) => {
                                set.hasWeight = Boolean(e.target.checked);
                            })
                            setSets([...sets]);
                        }}
                        style={{ marginRight: 8 }}
                    />
                    Measure Weight
                </label>
            </div>
        )
    }
    const MeasurementUnitBlock = () => {
        if (!hasWeight) return null;
        return (
            <div style={{ marginBottom: 8 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Weight Measurement Unit</label>
                <select
                    value={measurementUnit}
                    onChange={e => setMeasurementUnit(e.target.value as MeasurementUnit)}
                    style={{ maxWidth: 200, fontSize: 15, padding: '7px 10px', borderRadius: 8, border: '1px solid #ccc', width: '100%' }}
                >
                    <option value="Unit">Unit</option>
                    <option value="Kg">Kg</option>
                    <option value="Lb">Lb</option>
                    <option value="Plate">Plate</option>
                    <option value="Hole">Hole</option>
                </select>
            </div>
        )
    }

    const ExerciseTile = () => {
        return (
            <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Exercise title"
                style={{ fontSize: 16, padding: '8px 12px', borderRadius: 8, border: '1px solid #ccc', width: '100%', marginBottom: 8, boxSizing: 'border-box' }}

            />
        )
    }

    const SetsListHeaderBlock = () => {
        const addNewSet = () => {
            if (sets.length > 0) {
                const last = sets[sets.length - 1];
                setSets([
                    ...sets,
                    {
                        ...last,
                        id: Math.random().toString(36).substr(2, 9)
                    }
                ]);
            } else {
                const newSet: SetItem = {
                    id: Math.random().toString(36).substr(2, 9),
                };
                if (hasReps) {
                    newSet.reps = 10;
                    newSet.hasReps = true;
                }
                if (hasTime) {
                    newSet.time = 30;
                    newSet.hasTime = true
                }
                if (hasWeight) {
                    newSet.weight = 10;
                    newSet.hasWeight = true;
                }
                setSets([newSet]);
            }
        }
        return (

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 15, color: '#4F8A8B' }}>Sets</span>
                <button
                    type="button"
                    style={{ background: '#4F8A8B', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, cursor: 'pointer' }}
                    onClick={addNewSet}
                    aria-label="Add Set"
                >
                    +
                </button>
            </div>


        )
    }
    const DelSaveCloseBlock = () => {
        return (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
                {exercise && (
                    <button
                        style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                        onClick={() => setShowDeleteConfirm(true)}
                    >Delete</button>
                )}

                <button
                    style={{ background: '#4F8A8B', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                    onClick={() => {

                        const sanitizedSets = sets.map(set => ({
                            ...set,
                            reps: set.reps === undefined ? 0 : set.reps,
                            time: set.time === undefined ? 0 : set.time,
                            weight: set.weight === undefined ? 0 : set.weight,
                            hasTime: set.hasTime === undefined ? false : set.hasTime,
                            hasWeight: set.hasWeight === undefined ? false : set.hasWeight,
                            hasReps: set.hasReps === undefined ? false : set.hasReps
                        }));
                        if (exercise) {
                            onSave({ id: exercise.id, title, sets: sanitizedSets, measurementUnit });
                        }
                        else {
                            let _title = title || 'New Exercise';
                            onAddExercise({
                                id: Math.random().toString(36).substr(2, 9),
                                title: _title || 'New Exercise',
                                hasTime: Boolean(hasTime),
                                hasWeight: Boolean(hasWeight),
                                hasRepetitions: Boolean(hasRepetitions),
                                measurementUnit: measurementUnit || 'Unit',
                                sets: sanitizedSets,
                            });
                        }
                    }}

                >{exercise ? 'Save' : 'Create'}</button>
                <button
                    style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                    onClick={onClose}
                >Close</button>
            </div>
        )
    }
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 320, boxShadow: '0 2px 16px rgba(0,0,0,0.13)', display: 'flex', flexDirection: 'column', gap: 18 }}>
                {DialogTitle()}
                {LatestHistory(latestHistory)}
                {ExerciseTile()}
                <details {...(!exercise ? { open: true } : {})} style={{ marginBottom: 10 }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 15, color: '#4F8A8B', marginBottom: 6 }}>Exercise Options</summary>
                    <div style={{ marginTop: 8, marginLeft: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {HasTimeBlock()}
                        {HasWeightBlock()}
                        {MeasurementUnitBlock()}
                        {HasRepetitionsBlock()}
                    </div>
                </details>


                <div style={{ marginTop: 10, marginBottom: 10 }}>
                    {SetsListHeaderBlock()}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {renderSetInputs(sets, measurementUnit, setSets)}
                    </div>
                </div>

                {DelSaveCloseBlock()}
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
