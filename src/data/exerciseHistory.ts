import { db, auth } from '../firebase/config';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
export interface ExerciseHistoryRecord {
    exerciseId: string;
    title: string;
    sets: Array<{
        id: string;
        value: number;
        reps?: number;
    }>;
    measurement?: 'Time' | 'Weight' | 'Body Weight';
    measurementUnit?: string;
    timestamp: number; // Unix epoch ms
}


export async function saveExerciseHistory(record: ExerciseHistoryRecord) {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('User not authenticated');
    }
    const docData = {
        ...record,
        uid: user.uid,
        timestamp: new Date().toISOString(), // Store as ISO string
    };
    console.log('Saving exercise history:', JSON.stringify(docData, null, 2));
    await addDoc(collection(db, 'exercise_history'), docData);
}

export async function getExerciseHistory(uid: string): Promise<ExerciseHistoryRecord[]> {
    // Fetch all exercise history for a user
    const q = query(collection(db, 'exercise_history'), where('uid', '==', uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : Date.now(),
        } as ExerciseHistoryRecord;
    });
}

