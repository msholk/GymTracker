import { ExerciseHistoryRecord, saveExerciseHistory, getExerciseHistory, deleteExerciseHistory } from '../data/exerciseHistory';

// Utility class for caching exercise history in localStorage with expiry
export class HistoryCache {
    private key: string;
    private uid: string;
    private expiryMs: number;
    private setToUI: (data: ExerciseHistoryRecord[]) => void;
    private _syncing: boolean = false;
    private _intervalId: number | null = null;

    constructor(uid: string, expiryMs: number = 1000 * 60 * 10, setExerciseHistory: (data: ExerciseHistoryRecord[]) => void) {
        this.key = 'exerciseHistory_' + uid;
        this.uid = uid;
        this.expiryMs = expiryMs;
        this.setToUI = setExerciseHistory;

        // Start periodic sync every 2 minutes if online
        this._intervalId = window.setInterval(() => {
            if (navigator.onLine && this.getQueue().length > 0) {
                this.syncQueue();
            }
        }, 2 * 60 * 1000);

        // Clean up timer on window unload
        window.addEventListener('unload', () => {
            if (this._intervalId !== null) {
                clearInterval(this._intervalId);
            }
        });
    }

    addRecord(historyRecord: ExerciseHistoryRecord) {
        const history = this.getFromCache();
        history.push(historyRecord);
        this.setToCacheAndUI(history);
        this.addToQueue(historyRecord);
    }
    deleteRecord(historyRecord: ExerciseHistoryRecord) {
        const history = this.getFromCache();
        const newHistory = history.filter((q: ExerciseHistoryRecord) => q.docId !== historyRecord.docId);

        this.setToCacheAndUI(newHistory);
        this.addToQueue(historyRecord, 'delete');
    }

    // Call this to process and sync the pending queue
    async syncQueue() {
        if (this._syncing) return;
        this._syncing = true;
        let queue = this.getQueue();
        if (!queue.length) {
            return;
        }
        const maxRetries = 7;
        const baseDelay = 1000; // 1 second
        while (queue.length) {
            const qRecord = queue[0];
            let attempt = 3;
            let success = false;
            while (attempt < maxRetries && !success) {
                try {
                    if (qRecord.action === 'add') {
                        console.log('HistoryCache: syncing(adding) record to server', qRecord.record);
                        await saveExerciseHistory(qRecord.record);
                    }
                    else if (qRecord.action === 'delete') {
                        await deleteExerciseHistory("" + qRecord.record.docId);
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
                queue = latestQueue.filter(q => q.record.docId !== qRecord.record.docId);
                this.setQueue(queue);
            }
            else {
                break; // Exit if unable to sync after max retries
            }
        }
        this._syncing = false;
    }

    private getQueueKey() {
        return this.key + '_pendingQueue';
    }

    private getQueue(): Array<{ action: string; record: ExerciseHistoryRecord }> {
        try {
            const raw = localStorage.getItem(this.getQueueKey());
            if (!raw) return [];
            return JSON.parse(raw);
        } catch {
            return [];
        }
    }

    private setQueue(queue: Array<{ action: string; record: ExerciseHistoryRecord }>) {
        try {
            localStorage.setItem(this.getQueueKey(), JSON.stringify(queue));
        } catch { }
        setTimeout(() => {
            this.syncQueue();
        }, 100);

    }

    private addToQueue(record: ExerciseHistoryRecord, action: string = 'add') {
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
                console.log('HistoryCache: fetched from localStorage');

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
        console.log('HistoryCache: fetching from DB');
        setTimeout(() => {
            getExerciseHistory(this.uid)
                .then(hst => {
                    console.log('HistoryCache: fetched from DB');
                    this.setToCacheAndUI(hst);
                });
        }, 5000);
    }

    async retrieve() {
        this.setToUIFromCache();
        this.getFromDb();
    }
}
