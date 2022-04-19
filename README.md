# Signo

Simple Typed Signals.

[![NPM](https://nodei.co/npm/signo.png)](https://npmjs.org/package/signo)

Designed as a simple way to communicate between functional code and a user interface.

Provides two classes:

- `Signal` is for communicating values from the sender to one or more receivers. Note that the value type can be omitted (void).

- `SignalWithResult` is for also returning a result to the sender.

Signals can be sent (`send`), awaited (`await`), subscribed (`on`), and unsubscribed (`off`).

## Examples

### Signal without value or result:

```typescript
import { Signal } from "signo";

const exampleSignal = new Signal();

exampleSignal.on(() => {
    console.log("Hello world!");
});

exampleSignal.send();
```

Expected output:
```
Hello world!
```

### Signal with value:

```typescript
import { Signal } from "signo";

const exampleSignal = new Signal<string>();

exampleSignal.on(value => {
    console.log(value);
});

exampleSignal.on(async value => {
    console.log(`Async ${value}`);
});

exampleSignal.send("Hello world!", () => {
    console.log("Done!")
});

exampleSignal.await("Async!").then(() => {
    console.log("Async done!");
}).catch(console.error);
```

Expected output:
```
Hello world!
Async!
Async Hello world!
Done!
Async Async!
Async done!
```

### Signal with value and result:

```typescript
import { SignalWithResult } from "signo";

const exampleSignal = new SignalWithResult<number, string>();

exampleSignal.on(value => {
    // Undefined results are ignored
    return undefined;
});

exampleSignal.on(value => {
    // The first non-undefined result is used
    return `Is your number ${value}?`;
});

exampleSignal.on(value => {
    // Subsequent results are ignored
    return `Hello ${value}!`;
});

exampleSignal.send(42, result => {
    console.log(result);
});
```

Expected output:
```
Is your number 42?
```