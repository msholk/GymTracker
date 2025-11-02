export type MeasurementUnit = 'Unit' | 'Kg' | 'Lb' | 'Plate' | 'Hole';

export interface SetItem {
    id: string;
    hasReps?: boolean;
    hasTime?: boolean;
    hasWeight?: boolean;
    reps?: number;
    time?: number;
    weight?: number;
    value?: number;
}

export interface ExerciseProps {
    id: string;
    title: string;
    hasRepetitions?: boolean;
    hasTime?: boolean;
    hasWeight?: boolean;
    measurementUnit?: MeasurementUnit;
    sets?: SetItem[];
    measurement?: 'Time' | 'Weight' | 'Body Weight';
}
