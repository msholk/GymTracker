// src/usePwaUpdate.ts
import { useEffect, useState } from 'react';

export function usePwaUpdate() {
    const [waiting, setWaiting] = useState<ServiceWorkerRegistration | null>(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then(reg => {
                if (reg && reg.waiting) {
                    setWaiting(reg);
                    setShow(true);
                }
            });
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        }
        // Listen for custom event from vite-plugin-pwa
        window.addEventListener('swUpdated', (event: any) => {
            const reg = event.detail && event.detail.registration;
            if (reg) {
                setWaiting(reg);
                setShow(true);
            }
        });
    }, []);

    const update = () => {
        if (waiting && waiting.waiting) {
            waiting.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        setShow(false);
    };

    return { show, update };
}
