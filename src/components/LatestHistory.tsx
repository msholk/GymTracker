import React from 'react';
import { ExerciseHistoryRecord } from '../data';
import { formatSetsShort } from '../utils/formatSetsShort';

export const LatestHistory = (latestHistory: ExerciseHistoryRecord | null | undefined) => {
    return latestHistory && (
        <div style={{ color: '#4F8A8B', fontSize: 14, fontStyle: 'italic', marginBottom: 6 }}>
            {latestHistory.timestamp && (
                <span style={{ color: '#888', marginLeft: 6 }}>
                    {new Date(latestHistory.timestamp).toLocaleDateString('en-GB')}
                </span>
            )}
            <span style={{ marginLeft: 12 }}>{formatSetsShort(latestHistory)}</span>
            <span style={{ marginLeft: 12 }}>Difficulty: {latestHistory.difficulty}</span>
        </div>
    );
};
