import type { SetItem, ExerciseProps } from '../types/exercise';
import type { ExerciseHistoryRecord } from '../data/exerciseHistory';

export function formatSetsShort(ex: ExerciseProps | ExerciseHistoryRecord | null | undefined): string {
    if (!ex) return '';
    const sets = ex.sets;
    if (!sets || sets.length === 0) return '';
    // Helper to describe a set
    const setDesc = (set: SetItem) => {
        let desc = '';
        // For ExerciseProps, SetItem may have hasTime/hasWeight/hasReps; for ExerciseHistoryRecord, just check for time/weight/reps
        if ('hasTime' in set ? set.hasTime && set.time : set.time) {
            desc += `${set.time}s`;
        }
        if ('hasWeight' in set ? set.hasWeight && set.weight : set.weight) {
            desc += ` ${set.weight}${ex.measurementUnit || ''}`;
        }
        if ('hasReps' in set ? set.hasReps && set.reps : set.reps) {
            desc += ` x${set.reps}`;
        }
        return desc.trim();
    };
    // Check if all setDesc results are the same
    const firstDesc = setDesc(sets[0]);
    if (sets.length === 1) {
        return firstDesc;
    }
    const allSame = sets.every(s => setDesc(s) === firstDesc);
    if (allSame) {
        return `${sets.length} x (${firstDesc})`;
    } else {
        return sets.map(setDesc).join(', ');
    }
}
