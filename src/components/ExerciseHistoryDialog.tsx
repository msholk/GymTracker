import React, { useState } from 'react';
import { ExerciseHistoryRecord } from '../data/exerciseHistory';

interface ExerciseHistoryDialogProps {
    open: boolean;
    exerciseTitle: string;
    history: ExerciseHistoryRecord[];
    onClose: () => void;
    onDelete?: (h: ExerciseHistoryRecord & { docId?: string }) => void;
}

import { formatSetsShort } from '../utils/formatSetsShort';

const ExerciseHistoryDialog: React.FC<ExerciseHistoryDialogProps> = ({ open, exerciseTitle, history, onClose, onDelete }) => {
    const [deleting, setDeleting] = useState<string | null>(null);

    // Helper to get docId from history entry (assume timestamp+sets hash is unique if no docId)
    // Ideally, history should include Firestore docId. If not, this needs to be added in getExerciseHistory.
    const getDocId = (h: ExerciseHistoryRecord & { docId?: string }) => (h as any).docId || '';

    const handleDelete = async (h: ExerciseHistoryRecord & { docId?: string }) => {
        const docId = getDocId(h);
        if (!docId) {
            alert('Cannot delete: missing document id.');
            return;
        }
        setDeleting(docId);
        try {
            // Optionally, trigger a refresh or callback to parent to update history
            onDelete && onDelete(h);
        } catch (e) {
            alert('Failed to delete history entry.');
        } finally {
            setDeleting(null);
        }
    };
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
                                    {grouped[date].map((h, i) => {
                                        let histRecord = h
                                        return (
                                            <li key={h.timestamp + '-' + i} style={{ marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ color: '#333', fontSize: 14 }}>
                                                    {formatSetsShort(h)}  Difficulty: {h.difficulty}
                                                </div>
                                                <button
                                                    style={{ marginLeft: 12, background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 13, cursor: 'pointer', opacity: deleting === getDocId(h) ? 0.6 : 1 }}
                                                    disabled={deleting === getDocId(h)}
                                                    onClick={() => {
                                                        debugger
                                                        handleDelete(histRecord);
                                                    }}
                                                >{deleting === histRecord.docId ? 'Deleting...' : '-'}</button>
                                            </li>
                                        )
                                    })}
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
