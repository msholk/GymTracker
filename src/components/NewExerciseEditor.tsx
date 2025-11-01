import React, { useState } from 'react';

interface NewExerciseEditorProps {
    onSelect: (exercise: { name: string; measurement: 'Time' | 'Weight' | 'Body Weight'; hasRepetitions: boolean }) => void;
    onClose: () => void;
}

const measurementTypes = ['Time', 'Weight', 'Body Weight'] as const;

type MeasurementType = typeof measurementTypes[number];


const NewExerciseEditor: React.FC<NewExerciseEditorProps> = ({ onSelect, onClose }) => {
    const [name, setName] = useState('');
    const [measurement, setMeasurement] = useState<MeasurementType>('Time');
    const [hasRepetitions, setHasRepetitions] = useState<boolean>(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSelect({ name: name.trim(), measurement, hasRepetitions });
        setName('');
        setMeasurement('Time');
        setHasRepetitions(true);
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 320, boxShadow: '0 2px 16px rgba(0,0,0,0.13)' }}>
                <div style={{ fontWeight: 700, fontSize: 20, color: '#4F8A8B', marginBottom: 18 }}>Add New Exercise</div>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Title</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Exercise name"
                            style={{ fontSize: 16, padding: '8px 12px', borderRadius: 8, border: '1px solid #ccc', width: '100%', boxSizing: 'border-box', marginRight: 0, marginLeft: 0 }}
                            autoFocus
                        />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Has Repetitions?</label>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <label style={{ fontWeight: 500 }}>
                                <input
                                    type="radio"
                                    name="hasRepetitions"
                                    value="yes"
                                    checked={hasRepetitions === true}
                                    onChange={() => setHasRepetitions(true)}
                                    style={{ marginRight: 6 }}
                                />
                                Yes
                            </label>
                            <label style={{ fontWeight: 500 }}>
                                <input
                                    type="radio"
                                    name="hasRepetitions"
                                    value="no"
                                    checked={hasRepetitions === false}
                                    onChange={() => setHasRepetitions(false)}
                                    style={{ marginRight: 6 }}
                                />
                                No
                            </label>
                        </div>
                    </div>
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Measurement Type</label>
                        <select
                            value={measurement}
                            onChange={e => setMeasurement(e.target.value as MeasurementType)}
                            style={{ fontSize: 16, padding: '8px 12px', borderRadius: 8, border: '1px solid #ccc', width: '100%' }}
                        >
                            {measurementTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                        >Cancel</button>
                        <button
                            type="submit"
                            style={{ background: '#4F8A8B', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                            disabled={!name.trim()}
                        >Add</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewExerciseEditor;
