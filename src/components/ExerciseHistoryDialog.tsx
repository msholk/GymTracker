import React from 'react';
import { ExerciseHistoryRecord } from '../data/exerciseHistory';

interface ExerciseHistoryDialogProps {
    open: boolean;
    exerciseTitle: string;
    history: ExerciseHistoryRecord[];
    onClose: () => void;
}

import { formatSetsShort } from '../utils/formatSetsShort';
import { ExerciseProps } from '../types/exercise';

const ExerciseHistoryDialog: React.FC<ExerciseHistoryDialogProps> = ({ open, exerciseTitle, history, onClose }) => {
    if (!open) return null;
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 36, minWidth: 320, boxShadow: '0 2px 16px rgba(0,0,0,0.13)', maxHeight: '80vh', overflowY: 'auto' }}>
                <div style={{ fontWeight: 700, fontSize: 20, color: '#4F8A8B', marginBottom: 12 }}>{exerciseTitle} History</div>
                {history.length === 0 ? (
                    <div style={{ color: '#888', fontSize: 15 }}>No history for this exercise.</div>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {history.map((h, i) => (
                            <li key={h.timestamp + '-' + i} style={{ marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #eee' }}>
                                <div style={{ color: '#4F8A8B', fontSize: 15, fontWeight: 600 }}>
                                    {new Date(h.timestamp).toLocaleDateString('en-GB')}
                                </div>
                                <div style={{ color: '#333', fontSize: 14, marginTop: 2 }}>
                                    {formatSetsShort(h)}  Difficulty: {h.difficulty}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
                    <button
                        style={{ background: '#4F8A8B', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
                        onClick={onClose}
                    >Close</button>
                </div>
            </div>
        </div>
    );
};

export default ExerciseHistoryDialog;
