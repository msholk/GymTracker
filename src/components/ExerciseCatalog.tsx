import React from 'react';
import { exerciseCatalog, CatalogExercise } from '../data/exerciseCatalog';

interface ExerciseCatalogProps {
    onSelect: (exercise: CatalogExercise) => void;
    onClose: () => void;
}

const ExerciseCatalog: React.FC<ExerciseCatalogProps> = ({ onSelect, onClose }) => {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 340, maxWidth: 420, boxShadow: '0 2px 16px rgba(0,0,0,0.13)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <h3 style={{ margin: 0, color: '#4F8A8B' }}>Exercise Catalog</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>&times;</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {exerciseCatalog.map(ex => (
                        <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 0', borderBottom: '1px solid #eee', cursor: 'pointer' }} onClick={() => onSelect(ex)}>
                            <span style={{ fontSize: 28 }}>{ex.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 17 }}>{ex.name}</div>
                                <div style={{ color: '#666', fontSize: 14 }}>
                                    {ex.type === 'weight' ? `${ex.defaultSets}x${ex.defaultReps} reps` : `${ex.defaultSets}x${ex.defaultDurationSecs} secs`}
                                </div>
                            </div>
                            <span style={{ color: '#4F8A8B', fontSize: 18 }}>{ex.type === 'weight' ? '🏋️' : '⏱️'}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ExerciseCatalog;
