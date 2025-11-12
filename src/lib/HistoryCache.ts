import { ExerciseHistoryRecord, saveExerciseHistory, getExerciseHistory } from '../data/exerciseHistory';

// Utility class for caching exercise history in localStorage with expiry
export class HistoryCache {
    private key: string;
    private uid: string;
    private expiryMs: number;
    private setToUI: (data: ExerciseHistoryRecord[]) => void;
    constructor(uid: string, expiryMs: number = 1000 * 60 * 10, setExerciseHistory: (data: ExerciseHistoryRecord[]) => void) {
        this.key = 'exerciseHistory_' + uid;
        this.uid = uid;
        this.expiryMs = expiryMs;
        this.setToUI = setExerciseHistory;
    }
    addRecord(historyRecord: ExerciseHistoryRecord) {
        const history = this.getFromCache();
        history.push(historyRecord);
        this.setToCacheAndUI(history);
        setTimeout(async () => {
            await saveExerciseHistory(historyRecord);
            this.getFromDb();
        })
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
