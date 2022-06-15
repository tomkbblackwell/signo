export type SignalCallback<ValueType = void> = (signal: ValueType) => void | Promise<void>;

/**
 * A signal for communicating events and state between seperate parts of an application. Can optionally have a value.
 */
export class Signal<ValueType = void> {
    /** Unique ID. Useful for sending signals between javascript contexts. */
    public readonly id;
    private callbacks: SignalCallback<ValueType>[] = [];

    /** Define a new signal. */
    public constructor(id?: string | undefined) {
        this.id = id;
    }

    /**
     * Send a signal, and optionally wait for it's completion via a callback.
     * @param value Value to send with the signal. If the signal is valueless, this should be undefined.
     * @param callback Optional callback that will be triggered after all subscriptions (sync and async) have been executed.
     */
    public sendSync(value: ValueType, callback?: (() => void) | undefined): void {
        const promises: Promise<void>[] = [];

        for (const cb of this.callbacks) {
            const result = cb(value);
            if (result && typeof result === "object" && "then" in result) {
                promises.push(result);
                result.catch(console.error);
            }
        }

        if (promises.length > 0) {
            Promise.all(promises)
                .then(() => {
                    if (callback) {
                        callback();
                    }
                })
                .catch(console.error);
        } else if (callback) {
            callback();
        }
    }

    /**
     * Send a signal and return a promise that will resolve when all subscriptions have been executed.
     * @param value Value to send with the signal. Can be omitted if the signal is valueless.
     */
    public async sendAsync(value: ValueType): Promise<void> {
        for (const callback of this.callbacks) {
            await callback(value);
        }
    }

    /**
     * Subscribe to a signal. The callback functions can be either sync or async (by returning a promise).
     * @param callback Callback function, with the signal's value as the first parameter.
     */
    public on(callback: SignalCallback<ValueType>): void {
        this.callbacks.push(callback);
    }

    /**
     * Unsubscribe from a signal.
     * @param callback Callback function previously passed to Signal.on.
     */
    public off(callback: SignalCallback<ValueType>): void {
        const index = this.callbacks.indexOf(callback);
        if (index >= 0) {
            this.callbacks.splice(index, 1);
        }
    }
}

export type SignalWithResultCallback<ResultType extends {}, ValueType = void> = (signal: ValueType) => ResultType | undefined | Promise<ResultType | undefined>;

/**
 * A signal for communicating events and state between seperate parts of an application. Has a result. Can optionally have a value.
 */
export class SignalWithResult<ResultType extends {}, ValueType = void> {
    /** Unique ID. Useful for sending signals between javascript contexts. */
    public readonly id;
    private callbacks: SignalWithResultCallback<ResultType, ValueType>[] = [];

    /** Define a new signalWithValue. */
    public constructor(id?: string | undefined) {
        this.id = id;
    }

    /**
     * Send a signal, and optionally wait for it's completion and result via a callback.
     * @param value Value to send with the signal. If the signal is valueless, this should be undefined.
     * @param callback Optional callback that will be triggered after all subscriptions (sync and async) have been executed. The first argument is the signal's result.
     */
    public sendSync(value: ValueType, callback?: ((value: ResultType | undefined) => void) | undefined): void {
        const promises: Promise<ResultType | undefined>[] = [];
        let result: ResultType | undefined = undefined;

        for (const cb of this.callbacks) {
            const tempResult = cb(value);
            if (tempResult && typeof tempResult === "object" && "then" in tempResult) {
                promises.push(tempResult);
                tempResult.catch(console.error);
            } else {
                result ??= tempResult;
            }
        }

        if (promises.length > 0) {
            Promise.all(promises)
                .then(results => {
                    if (callback) {
                        for (const tempResult of results) {
                            result ??= tempResult;
                        }
                        callback(result);
                    }
                })
                .catch(console.error);
        } else if (callback) {
            callback(result);
        }
    }

    /**
     * Send a signal and return a promise that will resolve with the signal's result when all subscriptions have been executed.
     * @param value Value to send with the signal. Can be omitted if the signal is valueless.
     */
    public async sendAsync(value: ValueType): Promise<ResultType | undefined> {
        let result = undefined;
        for (const callback of this.callbacks) {
            result ??= await callback(value);
        }
        return result;
    }

    /**
     * Subscribe to a signal. The callback functions can be either sync or async (by returning a promise).
     * The first callback to return a non-undefined value will determine the signal's result.
     * @param callback Callback function, with the signal's value as the first parameter.
     */
    public on(callback: SignalWithResultCallback<ResultType, ValueType>): void {
        this.callbacks.push(callback);
    }
    
    /**
     * Unsubscribe from a signal.
     * @param callback Callback function previously passed to SignalWithCallback.on.
     */
    public off(callback: SignalWithResultCallback<ResultType, ValueType>): void {
        const index = this.callbacks.indexOf(callback);
        if (index >= 0) {
            this.callbacks.splice(index, 1);
        }
    }
}