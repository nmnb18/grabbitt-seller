// hooks/use-qr.ts
import api from '@/services/axiosInstance';
import { useCallback, useEffect, useRef, useState } from 'react';

export type QRMode = 'dynamic' | 'static' | 'multiple';

export interface ActiveQR {
    qr_id: string;
    qr_type: QRMode;
    qr_code_base64: string;
    expires_at?: any;
    status?: string;
    [key: string]: any;
}

interface UseSellerQROptions {
    autoLoad?: boolean;
    pollIntervalMs?: number;
}

export function useSellerQR(options?: UseSellerQROptions) {
    const [activeQR, setActiveQR] = useState<ActiveQR[]>([]);
    const [loadingQR, setLoadingQR] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pollInterval = options?.pollIntervalMs ?? 60000;

    // ✅ track interval
    const intervalRef = useRef<NodeJS.Timeout | number | null>(null);

    // ====================================================
    // ✅ FETCH ACTIVE QRs (MULTIPLE)
    // ====================================================
    const fetchActiveQR = useCallback(async () => {
        try {
            setError(null);
            setLoadingQR(true);

            const resp = await api.get('/getActiveQR');

            if (resp.status === 200 && resp.data?.success && Array.isArray(resp.data.data)) {
                setActiveQR(resp.data.data);
            } else {
                setActiveQR([]);
            }
        } catch (err: any) {
            if (err?.response?.status === 204) {
                setActiveQR([]);
            } else {
                setError(err?.response?.data?.error || 'Failed to load QR');
            }
        } finally {
            setLoadingQR(false);
        }
    }, []);

    // ====================================================
    // ✅ SMART POLLING CONTROL
    // ====================================================
    const startPolling = useCallback(() => {
        if (intervalRef.current) return;

        intervalRef.current = setInterval(() => {
            fetchActiveQR();
        }, pollInterval);
    }, [fetchActiveQR, pollInterval]);

    const stopPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current as any);
            intervalRef.current = null;
        }
    }, []);

    // ====================================================
    // ✅ INITIAL LOAD
    // ====================================================
    useEffect(() => {
        if (options?.autoLoad !== false) {
            fetchActiveQR();
        }

        return () => stopPolling();
    }, []);

    // ====================================================
    // ✅ DYNAMIC QR EXPIRY POLLING (ARRAY SAFE)
    // ====================================================
    useEffect(() => {
        stopPolling();

        if (!activeQR.length) return;

        // ✅ find if ANY dynamic QR exists
        const dynamicQR = activeQR.find((qr) => qr.qr_type === 'dynamic' && qr.expires_at);

        if (!dynamicQR) return;

        const expiresAt = dynamicQR.expires_at?._seconds
            ? new Date(dynamicQR.expires_at._seconds * 1000)
            : new Date(dynamicQR.expires_at);

        if (expiresAt.getTime() <= Date.now()) {
            fetchActiveQR(); // refresh expired QR
            return;
        }

        startPolling();

        return () => stopPolling();
    }, [activeQR, fetchActiveQR, startPolling, stopPolling]);

    // ====================================================
    // ✅ CREATE QR
    // ====================================================
    const generateQR = useCallback(
        async (payload: any) => {
            const resp = await api.post('/generateQRCode', payload);
            await fetchActiveQR();
            return resp;
        },
        [fetchActiveQR]
    );

    return {
        activeQR,
        loadingQR,
        error,
        fetchActiveQR,
        generateQR,
        setActiveQR,
    };
}
