type IAPCallbacks = {
    onVerifying?: () => void;
    onSuccess?: (data: any) => void;
    onError?: (err: any) => void;
};

let callbacks: IAPCallbacks = {};

export const setIAPCallbacks = (cbs: IAPCallbacks) => {
    callbacks = cbs;
};

export const clearIAPCallbacks = () => {
    callbacks = {};
};

export const notifyIAPVerifying = () => {
    callbacks.onVerifying?.();
};

export const notifyIAPSuccess = (data: any) => {
    callbacks.onSuccess?.(data);
};

export const notifyIAPError = (err: any) => {
    callbacks.onError?.(err);
};
