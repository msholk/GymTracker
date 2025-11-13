import { db, auth } from '../firebase/config';
import { collection, addDoc, getDocs, query, where, Timestamp, deleteDoc, doc } from 'firebase/firestore';
// Delete a history record by Firestore document id
export async function deleteExerciseHistory(docId: string) {
    await deleteDoc(doc(db, 'exercise_history', docId));
}
export interface ExerciseHistoryRecord {
    exerciseId: string;
    title: string;
    sets: Array<{
        id: string;
        weight?: number;
        reps?: number;
        time?: number;
        measurementUnit?: string;
        hasRepetitions?: boolean;
        hasWeight?: boolean;
        hasTime?: boolean;

    }>;
    measurementUnit?: string;
    timestamp: string; // Unix epoch ms
    difficulty: number;
    docId?: string;
}




