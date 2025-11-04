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
    // Group history by date string (en-GB)
    const grouped: { [date: string]: ExerciseHistoryRecord[] } = {};
    history.forEach((h) => {
        const date = new Date(h.timestamp).toLocaleDateString('en-GB');
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(h);
    });

    // Sort dates descending (recent first)
    const sortedDates = Object.keys(grouped).sort((a, b) => {
        // Parse date strings as dd/mm/yyyy
        const [da, ma, ya] = a.split('/').map(Number);
        const [db, mb, yb] = b.split('/').map(Number);
        const dA = new Date(ya, ma - 1, da).getTime();
        const dB = new Date(yb, mb - 1, db).getTime();
        return dB - dA;
    });

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 36, minWidth: 320, boxShadow: '0 2px 16px rgba(0,0,0,0.13)', maxHeight: '80vh', overflowY: 'auto' }}>
                <div style={{ fontWeight: 700, fontSize: 20, color: '#4F8A8B', marginBottom: 12 }}>{exerciseTitle} History</div>
                {history.length === 0 ? (
                    <div style={{ color: '#888', fontSize: 15 }}>No history for this exercise.</div>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {sortedDates.map(date => (
                            <li key={date} style={{ marginBottom: 18 }}>
                                <div style={{ color: '#4F8A8B', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{date}</div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {grouped[date].map((h, i) => (
                                        <li key={h.timestamp + '-' + i} style={{ marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #eee' }}>
                                            <div style={{ color: '#333', fontSize: 14 }}>
                                                {formatSetsShort(h)}  Difficulty: {h.difficulty}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
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
