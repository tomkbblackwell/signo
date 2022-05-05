import { Signal, SignalWithResult } from "./index.js";

test("Sync Callback", () => {
    const signal = new Signal();

    let called = false;

    const callback = () => {
        called = true;
    };

    // Test signal.send without callback
    signal.on(callback);
    signal.sendSync();
    expect(called).toBe(true);

    // Test signal.send with sync callback
    called = false;
    signal.sendSync(undefined, () => {
        called = true;
    });
    expect(called).toBe(true);

    // Test signal.send with async callback
    called = false;
    signal.sendSync(undefined, async () => {
        called = true;
    });
    expect(called).toBe(true);

    // Test signal.off
    called = false;
    signal.off(callback);
    signal.sendSync();
    expect(called).toBe(false);
});

test("async Callback", async () => {
    const signal = new Signal();

    let called = false;

    const callback = async () => {
        called = true;
    };

    // Test signal.await
    signal.on(callback);
    await signal.sendAsync();
    expect(called).toBe(true);

    // Test signal.off
    called = false;
    signal.off(callback);
    await signal.sendAsync();
    expect(called).toBe(false);
});

test("sync signal w/ Value", done => {
    const signal = new Signal<number>();

    let result = 0;

    signal.on(value => {
        result = value;
    });

    signal.on(async value => {
        // Do nothing
    });

    signal.sendSync(42, () => {
        expect(result).toBe(42);
        done();
    });
});

test("async signal w/ Value", async () => {
    const signal = new Signal<number>();

    let result = 0;

    signal.on(async value => {
        result = value;
    });

    await signal.sendAsync(42);

    expect(result).toBe(42);
});

test("sync signal w/ result", done => {
    const signal = new SignalWithResult<number>();

    signal.on(() => {
        return undefined;
    });

    const callback = () => {
        return 42;
    };

    signal.on(callback);

    signal.on(() => {
        return 13;
    });


    // Test signal.send with sync callback
    signal.sendSync(undefined, result => {
        expect(result).toBe(42);
    });

    // Test signal.send with async callback
    signal.sendSync(undefined, async result => {
        expect(result).toBe(42);
    });

    signal.off(callback);

    signal.sendSync(undefined, result => {
        expect(result).toBe(13);
        done();
    });
});

test("async signal w/ result", async () => {
    const signal = new SignalWithResult<number>();

    signal.on(async () => {
        return undefined;
    });

    const callback = async () => {
        return 42;
    };

    signal.on(callback);

    signal.on(async () => {
        return 13;
    });

    let result = await signal.sendAsync();

    expect(result).toBe(42);

    signal.off(callback);

    result = await signal.sendAsync();

    expect(result).toBe(13);
});

test("sync corner cases", done => {
    const signal = new SignalWithResult<number, number>();

    signal.on(() => {
        return undefined;
    });

    signal.on(async value => {
        return value + 10;
    });

    signal.on(async () => {
        return 13;
    });

    signal.sendSync(32, result => {
        expect(result).toBe(42);
    });

    signal.sendAsync(15).then(result => {
        expect(result).toBe(25);
        done();
    }).catch(console.error);
});

test("async corner cases", async () => {
    const signal = new SignalWithResult<number, number>();

    signal.on(() => {
        return undefined;
    });

    signal.on(value => {
        return new Promise(resolve => {
            resolve(value + 10);
        });
    });

    signal.on(async () => {
        return 13;
    });

    const result = await signal.sendAsync(32);
    expect(result).toBe(42);
});

test("error handling", () => {
    const signal = new Signal();

    let called = false;

    const callback = async () => {
        return new Promise<void>((resolve, reject) => {
            reject("Test error");
            called = true;
        });
    };

    // Test signal.send without callback
    signal.on(callback);
    signal.sendAsync();
    signal.sendSync(undefined, () => {
        expect(called).toBe(false);
    });
});