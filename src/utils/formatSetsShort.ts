import type { SetItem, ExerciseProps } from '../types/exercise';

export function formatSetsShort(sets: SetItem[], ex: ExerciseProps) {
    if (!sets || sets.length === 0) return '';
    // Helper to describe a set
    const setDesc = (set: SetItem) => {
        let desc = '';
        if (set.hasTime && set.time) {
            desc += `${set.time}s`;
        }
        if (set.hasWeight && set.weight) {
            desc += ` ${set.weight}${ex.measurementUnit}`;
        }
        if (set.hasReps && set.reps) {
            desc += ` x${set.reps}`;
        }
        return desc;
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
