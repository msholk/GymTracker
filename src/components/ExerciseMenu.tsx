import React, { useRef, useEffect, useState } from 'react';
import type { Routine } from './Routines';

interface ExerciseMenuProps {
    anchorRef: React.RefObject<HTMLButtonElement>;
    open: boolean;
    onClose: () => void;
    onPlay: () => void;
    onEdit: () => void;
    onHistory: () => void;
    exerciseTitle: string;
    onMoveToRoutine: (targetRoutineId: string) => void;
    onCopyToRoutine: (targetRoutineId: string) => void;
    routines: Routine[];
    currentRoutineId: string;
}

const ExerciseMenu: React.FC<ExerciseMenuProps> = ({
    anchorRef, open, onClose, onPlay, onEdit, onHistory, exerciseTitle,
    onMoveToRoutine, onCopyToRoutine, routines, currentRoutineId
}) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    const [showMoveList, setShowMoveList] = useState(false);
    const [showCopyList, setShowCopyList] = useState(false);
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
        function handleClickOutside(event: MouseEvent) {
            if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) onClose();
        }
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, onClose]);
    if (!open) return null;
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div ref={dialogRef} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.18)', padding: '32px 28px 24px 28px', minWidth: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: 10, right: 12, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }} aria-label="Close">×</button>
                <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 18 }}>{exerciseTitle}</div>
                <button style={{ display: 'flex', alignItems: 'center', gap: 10, width: 180, background: '#f5f5f5', border: 'none', borderRadius: 8, padding: '12px 0', margin: '6px 0', fontSize: 16, cursor: 'pointer', justifyContent: 'center' }} onClick={onPlay}>
                    <span role="img" aria-label="Play" style={{ fontSize: 22 }}>▶️</span> Play
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: 10, width: 180, background: '#f5f5f5', border: 'none', borderRadius: 8, padding: '12px 0', margin: '6px 0', fontSize: 16, cursor: 'pointer', justifyContent: 'center' }} onClick={onEdit}>
                    <span role="img" aria-label="Edit" style={{ fontSize: 22 }}>✏️</span> Edit
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: 10, width: 180, background: '#f5f5f5', border: 'none', borderRadius: 8, padding: '12px 0', margin: '6px 0', fontSize: 16, cursor: 'pointer', justifyContent: 'center' }} onClick={onHistory}>
                    <span role="img" aria-label="History" style={{ fontSize: 22 }}>📜</span> History
                </button>
                {/* Separator */}
                <div style={{ width: '90%', height: 1, background: '#e0e0e0', margin: '16px 0' }} />
                <button
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: 180, background: '#e3f2fd', border: 'none', borderRadius: 8, padding: '12px 0', margin: '6px 0', fontSize: 16, cursor: 'pointer', justifyContent: 'center', color: '#1976d2', fontWeight: 600 }}
                    onClick={() => setShowMoveList(v => !v)}
                >
                    <span role="img" aria-label="Move" style={{ fontSize: 22 }}>📦</span> Move to Routine
                </button>
                {showMoveList && (
                    <div style={{ margin: '10px 0', width: '100%' }}>
                        <div style={{ fontWeight: 500, marginBottom: 6 }}>Select routine:</div>
                        <div style={{ maxHeight: 180, overflowY: 'auto', width: '100%' }}>
                            {routines && routines.length > 0 ? routines.map(r => (
                                <button
                                    key={r.id}
                                    disabled={r.id === currentRoutineId}
                                    style={{
                                        width: '100%',
                                        padding: '8px 0',
                                        margin: '2px 0',
                                        border: 'none',
                                        borderRadius: 6,
                                        background: r.id === currentRoutineId ? '#eee' : '#e3f2fd',
                                        color: r.id === currentRoutineId ? '#aaa' : '#1976d2',
                                        fontWeight: 600,
                                        cursor: r.id === currentRoutineId ? 'not-allowed' : 'pointer',
                                        opacity: r.id === currentRoutineId ? 0.6 : 1
                                    }}
                                    onClick={() => { onMoveToRoutine(r.id); setShowMoveList(false); }}
                                >
                                    {r.title || 'Untitled Routine'}
                                </button>
                            )) : <div style={{ color: '#888', fontSize: 14 }}>No routines</div>}
                        </div>
                    </div>
                )}
                <button
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: 180, background: '#fffde7', border: 'none', borderRadius: 8, padding: '12px 0', margin: '6px 0', fontSize: 16, cursor: 'pointer', justifyContent: 'center', color: '#795548', fontWeight: 600 }}
                    onClick={() => setShowCopyList(v => !v)}
                >
                    <span role="img" aria-label="Copy" style={{ fontSize: 22 }}>📋</span> Copy to Routine
                </button>
                {showCopyList && (
                    <div style={{ margin: '10px 0', width: '100%' }}>
                        <div style={{ fontWeight: 500, marginBottom: 6 }}>Select routine:</div>
                        <div style={{ maxHeight: 180, overflowY: 'auto', width: '100%' }}>
                            {routines && routines.length > 0 ? routines.map(r => (
                                <button
                                    key={r.id}
                                    disabled={r.id === currentRoutineId}
                                    style={{
                                        width: '100%',
                                        padding: '8px 0',
                                        margin: '2px 0',
                                        border: 'none',
                                        borderRadius: 6,
                                        background: r.id === currentRoutineId ? '#eee' : '#fffde7',
                                        color: r.id === currentRoutineId ? '#aaa' : '#795548',
                                        fontWeight: 600,
                                        cursor: r.id === currentRoutineId ? 'not-allowed' : 'pointer',
                                        opacity: r.id === currentRoutineId ? 0.6 : 1
                                    }}
                                    onClick={() => { onCopyToRoutine(r.id); setShowCopyList(false); }}
                                >
                                    {r.title || 'Untitled Routine'}
                                </button>
                            )) : <div style={{ color: '#888', fontSize: 14 }}>No routines</div>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExerciseMenu;
export type { ExerciseMenuProps };