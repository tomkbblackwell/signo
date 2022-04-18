export type SignalCallback<ValueType = void> = (signal: ValueType) => void | Promise<void>;

export class Signal<ValueType = void> {
    private callbacks: SignalCallback<ValueType>[] = [];

    public constructor() {
        // Do nothing
    }

    public send(value: ValueType, callback?: (() => void) | undefined): void {
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

    public async await(value: ValueType): Promise<void> {
        for (const callback of this.callbacks) {
            await callback(value);
        }
    }

    public on(callback: SignalCallback<ValueType>): void {
        this.callbacks.push(callback);
    }

    public off(callback: SignalCallback<ValueType>): void {
        const index = this.callbacks.indexOf(callback);
        if (index >= 0) {
            this.callbacks.splice(index, 1);
        }
    }
}

export type SignalWithResultCallback<ValueType = void, ResultType = void> = (signal: ValueType) => ResultType | undefined | Promise<ResultType | undefined>;

export class SignalWithResult<ValueType = void, ResultType = void> {
    private callbacks: SignalWithResultCallback<ValueType, ResultType>[] = [];

    public constructor() {
        // Do nothing
    }

    public send(value: ValueType, callback?: ((value: ResultType | undefined) => void) | undefined): void {
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

    public async await(value: ValueType): Promise<ResultType | undefined> {
        let result = undefined;
        for (const callback of this.callbacks) {
            result ??= await callback(value);
        }
        return result;
    }

    public on(callback: SignalWithResultCallback<ValueType, ResultType>): void {
        this.callbacks.push(callback);
    }

    public off(callback: SignalWithResultCallback<ValueType, ResultType>): void {
        const index = this.callbacks.indexOf(callback);
        if (index >= 0) {
            this.callbacks.splice(index, 1);
        }
    }
}