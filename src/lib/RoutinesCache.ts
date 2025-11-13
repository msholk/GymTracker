import { Routine } from '@/components/Routines';
import { ExerciseHistoryRecord, } from '../data/exerciseHistory';
import { collection, getDocs, addDoc, query, where, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Utility class for caching exercise history in localStorage with expiry
export class RoutinesCache {
    private key: string;
    private uid: string;
    private expiryMs: number;
    private setToUI: (data: Routine[]) => void;
    private _syncing: boolean = false;
    private _intervalId: number | null = null;
    private _shouldFetchAfterSync: boolean = false;

    constructor(uid: string, expiryMs: number = 1000 * 60 * 10, setRoutines: (data: Routine[]) => void) {
        this.key = 'routines_' + uid;
        this.uid = uid;
        this.expiryMs = expiryMs;
        this.setToUI = setRoutines;

        // Start periodic sync every 2 minutes if online

        this._intervalId = window.setInterval(() => {
            if (navigator.onLine && this.getQueue().length > 0) {
                this.syncQueue();
            }
        }, 2 * 60 * 1000);

        //   Clean up timer on window unload
        window.addEventListener('unload', () => {
            if (this._intervalId !== null) {
                clearInterval(this._intervalId);
            }
        });
    }

    addNewRoutine() {
        // Generate a simple unique ID (UUID v4 style)
        function uuidv4() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        const newRoutine: Routine = {
            id: uuidv4(),
            isEditing: false,
            title: 'Untitled routine',
            createdAt: new Date().toISOString(),
            uid: this.uid,
            exercises: []
        };
        const routines = this.getFromCache();
        routines.push(newRoutine);
        this.setToCacheAndUI(routines);
        this.addToQueue(newRoutine);
        this.syncQueue();
    }
    deleteRoutine(id: string) {
        const routines = this.getFromCache();
        const routine2Delete: Routine[] = routines.filter((r: Routine) => r.id === id);
        const newRoutines = routines.filter((r: Routine) => r.id !== id);

        this.setToCacheAndUI(newRoutines);
        this.addToQueue(routine2Delete[0], 'delete');
        this.syncQueue();
    }
    updateRoutine(id: string, newProps: Partial<Routine>) {
        const routines = this.getFromCache();
        let routine2Update: Routine = routines.filter((r: Routine) => r.id === id)[0];
        routine2Update = { ...routine2Update, ...newProps };
        const newRoutines = routines.map((r: Routine) => r.id === id ? routine2Update : r);

        this.setToCacheAndUI(newRoutines);
        this.addToQueue(routine2Update, 'update');
        this.syncQueue();
    }

    // Call this to process and sync the pending queue
    async syncQueue() {
        if (this._syncing) return;
        this._syncing = true;
        let queue = this.getQueue();
        if (queue.length) {

            const maxRetries = 7;
            const baseDelay = 1000; // 1 second
            while (queue.length) {
                const qRecord = queue[0];
                let attempt = 3;
                let success = false;
                while (attempt < maxRetries && !success) {
                    try {
                        if (qRecord.action === 'add') {
                            console.log('RoutineCache: syncing(adding) record to server', qRecord.record);
                            await addDoc(collection(db, 'routines'), qRecord.record);
                        }
                        else if (qRecord.action === 'delete') {
                            await deleteDoc(doc(db, 'routines', qRecord.record.id));
                        }
                        else if (qRecord.action === 'update') {
                            const { id, ...dataToUpdate } = qRecord.record;
                            await updateDoc(doc(db, 'routines', id), dataToUpdate);
                        }
                        success = true;

                    } catch (e) {
                        attempt++;
                        if (attempt < maxRetries) {
                            // Exponential backoff
                            const delay = baseDelay * Math.pow(2, attempt - 1);
                            await new Promise(res => setTimeout(res, delay));

                        }

                    }
                }
                if (success) {
                    // Re-read the queue and filter out the record by docId (PK)
                    const latestQueue = this.getQueue();
                    queue = latestQueue.filter(q => q.record.id !== qRecord.record.id);
                    this.setQueue(queue);
                }
                else {
                    break; // Exit if unable to sync after max retries
                }
            }
        }
        this._syncing = false;

        if (this._shouldFetchAfterSync && queue.length === 0) {
            this._shouldFetchAfterSync = false;
            this.getFromDb();
        }





        // const addRoutine = async () => {
        //         if (!user) return;
        //         const docRef = await addDoc(collection(db, 'routines'), {
        //             title: '',
        //             createdAt: serverTimestamp(),
        //             uid: user.uid,
        //             exercises: []
        //         });
        //         setRoutines(routines => [
        //             {
        //                 id: docRef.id,
        //                 title: '',
        //                 createdAt: new Date(),
        //                 isEditing: true,
        //                 uid: user.uid,
        //                 exercises: []
        //             },
        //             ...routines
        //         ]);
        //     };

        // const duplicateRoutine = async (id: string) => {
        //     const routine = routines.find(r => r.id === id);
        //     if (!routine) return;
        //     setEditingId(null);

        //     const newRoutine = {
        //         title: routine.title + ' (Copy)',
        //         createdAt: serverTimestamp(),
        //         uid: routine.uid,
        //         exercises: routine.exercises ? routine.exercises.map(ex => ({
        //             ...ex,
        //             id: Math.random().toString(36).substr(2, 9), // new id for each exercise
        //             sets: ex.sets ? ex.sets.map(set => ({
        //                 ...set,
        //                 id: Math.random().toString(36).substr(2, 9) // new id for each set
        //             })) : undefined
        //         })) : []
        //     };
        //     const docRef = await addDoc(collection(db, 'routines'), newRoutine);
        //     setRoutines(routines => [
        //         {
        //             ...newRoutine,
        //             id: docRef.id,
        //             createdAt: new Date(),
        //             isEditing: true
        //         },
        //         ...routines
        //     ]);
        //     setEditingId(docRef.id);
        //     setEditTitle(newRoutine.title);
        //     setSelectedId(docRef.id);
        // }
    }

    private getQueueKey() {
        return this.key + '_pendingQueue';
    }

    private getQueue(): Array<{ action: string; record: Routine }> {
        try {
            const raw = localStorage.getItem(this.getQueueKey());
            if (!raw) return [];
            return JSON.parse(raw);
        } catch {
            return [];
        }
    }

    private setQueue(queue: Array<{ action: string; record: Routine }>) {
        try {
            localStorage.setItem(this.getQueueKey(), JSON.stringify(queue));
        } catch { }
        setTimeout(() => {
            this.syncQueue();
        }, 100);

    }

    private addToQueue(record: Routine, action: string = 'add') {
        const queue = this.getQueue();
        queue.push({
            action,
            record
        });
        this.setQueue(queue);
    }

    setToCacheAndUI(data: any) {
        try {
            const value = {
                data,
                expiry: Date.now() + this.expiryMs
            };
            localStorage.setItem(this.key, JSON.stringify(value));
            this.setToUI(data);
        } catch { }
    }

    getFromCache() {
        try {
            const raw = localStorage.getItem(this.key);
            if (!raw) {
                return [];
            }
            const parsed = JSON.parse(raw);
            if (parsed && parsed.expiry && parsed.data && Date.now() < parsed.expiry) {
                console.log('RoutinesCache: fetched from localStorage');

                return parsed.data;
            }
        } catch { }
        return [];
    }
    setToUIFromCache() {
        const fromCache = this.getFromCache();
        this.setToUI(fromCache);
    }

    async getFromDb() {
        console.log('%c Routines: fetching from DB 🛢️', 'color: #032423ff; font-style: italic');
        setTimeout(async () => {
            try {
                const q = query(
                    collection(db, 'routines'),
                    where('uid', '==', this.uid)
                );
                const snapshot = await getDocs(q);
                if (snapshot.metadata.fromCache && snapshot.docs.length === 0) {
                    console.warn('%c Routines: offline or no data in cache, skipping processing', 'color: orange; font-weight: bold');
                    return;
                }
                console.log(`%c Routines: fetched from DB 🛢️${snapshot.docs.length}`, 'color: #0b983eff; font-weight: bold');
                let routines = snapshot.docs.map(docSnap => {
                    const data = docSnap.data();
                    let createdAt: string;
                    if (data.createdAt && typeof data.createdAt.toDate === 'function') {
                        createdAt = data.createdAt.toDate().toISOString();
                    } else if (typeof data.createdAt === 'string') {
                        createdAt = data.createdAt;
                    } else if (data.createdAt instanceof Date) {
                        createdAt = data.createdAt.toISOString();
                    } else {
                        createdAt = new Date().toISOString();
                    }
                    return {
                        id: docSnap.id,
                        title: data.title,
                        createdAt,
                        isEditing: false,
                        uid: data.uid,
                        exercises: data.exercises || []
                    };
                });
                routines = routines.sort((a, b) => {
                    // First, sort by title (case-insensitive)
                    const titleA = (a.title || '').toLowerCase();
                    const titleB = (b.title || '').toLowerCase();
                    if (titleA < titleB) return -1;
                    if (titleA > titleB) return 1;
                    // If titles are equal, sort by createdAt (descending)
                    // Compare ISO strings as dates
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });
                this.setToCacheAndUI(routines);
            } catch (err) {
                console.error('Routines: error fetching from DB 🛢️', err);
            }
        }, 100);
    }

    async retrieveOnLoad() {
        this.setToUIFromCache();
        this._shouldFetchAfterSync = true;
        this.syncQueue();
    }
}
