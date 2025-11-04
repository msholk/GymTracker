import React from 'react';
import type { SetItem, MeasurementUnit } from '../../types/exercise';
import { formatSetsShort } from '../../utils/formatSetsShort';
import { ExerciseProps } from '../../types/exercise';
import '@ncdai/react-wheel-picker/dist/style.css';

import type { WheelPickerOption } from "@ncdai/react-wheel-picker";
import { WheelPicker } from "@ncdai/react-wheel-picker";
import { WheelPickerWrapper } from "@ncdai/react-wheel-picker";
const createArray = (min: number, max: number, step = 0): WheelPickerOption<number>[] => {
    const options: WheelPickerOption<number>[] = [];
    for (let v = min; v <= max; v += step) {
        options.push({ value: v, label: v.toString() });
    }
    return options;
};

export function renderSetInputs(
    sets: SetItem[],
    measurementUnit: MeasurementUnit,
    setSets: React.Dispatch<React.SetStateAction<SetItem[]>>,
    mode = 'edit'
) {
    if (sets.length === 0) {
        return <span style={{ color: '#aaa', fontSize: 14 }}>No sets</span>;
    }
    function getInputs({ set, idx }: {
        set: SetItem;
        idx: number;
    }) {

        if (set.completed) {
            const exercise: ExerciseProps = {
                id: '1',
                title: 'Bench Press',
                measurementUnit,
                sets: [set]
            };
            return (
                <>
                    <span style={{ color: '#888', fontSize: 14 }}>{
                        formatSetsShort(exercise)}</span>
                </>
            );
        }

        // Generic input for a numeric property
        function renderSetNumberInput({
            label, property, min = 0, step = 1, value, setSets, idx, max = 10
        }: {
            label: string;
            property: keyof SetItem;
            min?: number;
            step?: number;
            value: number | undefined;
            setSets: React.Dispatch<React.SetStateAction<SetItem[]>>;
            idx: number;
            max?: number;
        }) {
            const style = { width: 60, fontSize: 15, padding: '4px 8px', borderRadius: 6, border: '1px solid #ccc' };
            // Use WheelPicker for mobile-friendly number selection
            // Generate options for the picker
            const options = createArray(min, max, step);

            return (
                <>
                    <span style={{ color: '#888', fontSize: 14 }}>{label}</span>
                    <WheelPickerWrapper>
                        <WheelPicker
                            options={options}
                            value={value ?? 0}
                            onValueChange={(val: number) => {
                                setSets(sets => sets.map((s, i) => i === idx ? { ...s, [property]: val } : s));
                            }}
                            optionItemHeight={36}
                            visibleCount={7}
                            style={{ width: 60, display: 'inline-block' }}
                        />
                    </WheelPickerWrapper>
                </>
            );
        }

        let timeInput = null;
        if (set.hasTime) {
            timeInput = renderSetNumberInput({
                label: "secs",
                property: 'reps',
                min: 0,
                step: 1,
                max: 600,
                value: set.reps,
                setSets,
                idx
            });
        }
        let weightInput = null;
        if (set.hasWeight) {
            weightInput = renderSetNumberInput({
                label: measurementUnit + "s",
                property: 'weight',
                min: 0,
                max: 150,
                step: measurementUnit === 'Kg' || measurementUnit === 'Lb' ? 0.5 : 1,
                value: set.weight,
                setSets,
                idx
            });
        }
        let repsInput = null;
        if (set.hasReps) {
            repsInput = renderSetNumberInput({
                label: "reps",
                property: 'reps',
                min: 1,
                step: 1,
                max: 200,
                value: set.reps,
                setSets,
                idx
            });
        }
        return (
            <>{timeInput}{weightInput}{repsInput}</>
        );
    }

    function getSetButton({ set, idx }: { set: SetItem, idx: number }) {
        if (mode == "play") {
            return (
                <button
                    type="button"
                    style={{
                        background: set.completed ? '#e0f2f1' : '#ffe082', // yellow for uncompleted
                        color: set.completed ? '#388e3c' : '#e65100', // deep orange for uncompleted
                        border: 'none',
                        borderRadius: '50%',
                        width: 22,
                        height: 22,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: set.completed ? '0 0 0 2px #b2dfdb' : '0 0 0 2px #ffe082'
                    }}
                    onClick={() => setSets(sets => sets.map((s, i) => i === idx ? { ...s, completed: !s.completed } : s))}
                    aria-label={set.completed ? 'Unmark as Completed' : 'Mark as Completed'}
                    title={set.completed ? 'Unmark as Completed' : 'Mark as Completed'}
                >
                    {set.completed ? '✓' : '▶'}
                </button>
            );
        }
        return (
            <button
                type="button"
                style={{ background: '#eee', color: '#d32f2f', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                onClick={() => setSets(sets => sets.filter((_, i) => i !== idx))}
                aria-label="Remove Set"
            >
                &minus;
            </button>
        );
    }
    return sets.map((set, idx) => {
        return (
            <div key={set.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className='setNumberInput'>Set {idx + 1}:</span>
                {getInputs({ set, idx })}
                {getSetButton({ set, idx })}



            </div>
        );
    });
}
