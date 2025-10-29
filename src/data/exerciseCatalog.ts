// src/data/exerciseCatalog.ts
// Catalog of exercises for selection

export type ExerciseType = 'weight' | 'time';

export interface CatalogExercise {
    id: string;
    name: string;
    icon: string; // emoji or icon name
    type: ExerciseType;
    defaultSets?: number;
    defaultReps?: number;
    defaultDurationSecs?: number;
}

export const exerciseCatalog: CatalogExercise[] = [
    {
        id: 'pushup',
        name: 'Push Up',
        icon: '💪',
        type: 'weight',
        defaultSets: 2,
        defaultReps: 10,
    },
    {
        id: 'squat',
        name: 'Squat',
        icon: '🏋️',
        type: 'weight',
        defaultSets: 2,
        defaultReps: 10,
    },
    {
        id: 'plank',
        name: 'Plank',
        icon: '🧘',
        type: 'time',
        defaultSets: 1,
        defaultDurationSecs: 30,
    },
    {
        id: 'jumping_jack',
        name: 'Jumping Jack',
        icon: '🤸',
        type: 'time',
        defaultSets: 1,
        defaultDurationSecs: 30,
    },
    {
        id: 'bicep_curl',
        name: 'Bicep Curl',
        icon: '🏋️‍♂️',
        type: 'weight',
        defaultSets: 2,
        defaultReps: 10,
    },
    // Add more as needed
];
