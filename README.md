# IPeeSee (Inter-process communication)

<p align="center">
  <img src="./ipeesee-logo.png">
</p>

IPeeSee is a JS module built for the sake of easing the pain while working with native IPC
implementation in Electron.

IPeeSee is written in Typescript, is fully documented and provides all the necessary types.

Compared to some other modules, IPeeSee preserves the interfaces on both main and renderer process
and tries to accomplish one-way / two-way communication in the simplest way possible.

Besides communication, IPeeSee implements custom IPCError and IPCResponse. Those are implemented for
the sole sake of seperating errors/responses from other communication protocols.

# Install

> npm i ipeesee --save

## API

### `.send(channel, data, options)`

Sends a message to a channel.

#### Parameters

- channel _(string)_ - A channel to send a message to
- data _(any)_ - Data to send _(optional)_
- options _(object)_ - _(optional)_

  - **window** _(BrowserWindow)_ - An instance of browserWindow to send a message to. _Only required
    when using with ipcMain_

  - **reply** _(boolean)_ - By default, we always wait for the response. Setting this to false will
    make the communication one-way only. In simple words, we send a message and don't care about the
    response

  - **timeout** _(number)_ - Time (seconds) to wait before we manually resolve the reply

Resolves either an IPCError or IPCResponse with the following statusCodes:

- 204 - Resolved with no data in the response
- 200 - Resolved with the data in the response
- 408 - Resoled by manually timing out. This IPCResponse will also come with a message indicating
  the timeout and the channel we timed out at

Keep in mind that reply and timeout are mutually exclusive, meaning that setting timeout only makes
sense when we are actually waiting for the reply. If we aren't (if reply is set to false or not
passed at all), timeout will take no effect.

---

### `.reply(channel, callback)`

Adds a listener that replies to the provided channel

#### Parameters

- channel _(string)_ - A channel to reply to

- callback(data) _(Function)_ - Receives a message with optional data and responds back to the
  channel. In order to reply back, it's mandatory to return from this function

# Usage

IPeeSee interfaces are unified. This means that regardless if you are working with main or renderer
process, methods and arguments are the same.

## Constructor

IPeeSee constructor takes the process type (ipcMain, ipcRenderer) and an optional browserWindow that
you want to send a message to.

If you don't pass the window (browserWindow) to the constructor, you will have to pass it to .send()
each time you want to send a message from main to renderer process.

If your application only uses a single window, it's a good idea in that case to simply pass a window
to the constructor and not worry about passing it while using .send().

```js

const IPeeSee = require('ipeesee').default;
// or
import IPeeSee from 'ipeesee';

const ipc = new IPeeSee(ipcMain, yourWindow);
ipc.send('foo', { foo: 'bar' }).then(...).catch(...);
```

Or if you don't pass the window to the constructor, you will have to specify it in each .send _(only
when sending messages from main to renderer)_

```js
ipc.send('foo', { foo: 'bar' }, { window: yourBrowserWindow }).then(...).catch(...);
```

### Send a message that expects no reply

```js
ipc.send('foo', { foo: 'bar' }, { reply: false });
```

### Manually timeout the reply after N number of seconds

```js
ipc.send('foo', { foo: 'bar' }, { timeout: 30 }).then(...).catch(...);
```

### Renderer

```js
import { ipcRenderer } from 'electron';
import IPeeSee from 'ipeesee';

const ipc = new IPeeSee(ipcRenderer);

ipc
  .send('foo', { foo: 'bar' })
  .then(response => {
    console.log(response);
  })
  .catch(error => console.error(error)); // { message: 'Cabooom! }
```

### Main

```js
import { ipcMain } from 'electron';
import IPeeSee from 'ipeesee';

const ipc = new IPeeSee(ipcMain);

ipc.reply('foo', data => {
  return new Promise(resolve => {
    console.log(data); // data from sender
    resolve({ response: 'Foo is so Barish!' }); // respond back to sender
  });
});
```

_Communicating from main to renderer is done exactly the same way._

### Working with errors

IPC .send(channel, response) doesn't provide way to return node-like response e.g. (error,
response). For that reason, we have to work with a single object and make the best out of it.

To work around this limitation, IPeeSee will check if your response object has .error property on it
and if so, will reject it as IPCError. This means that no matter what, you will always resolve,
either an error or a valid response.

### Example with returning an IPCError

```js

ipc
  .send('get-todos', { id: 1 })
  .then(todo => {
    console.log(todo);
  })
  .catch(error => {
    console.log(error);
  });


ipc.reply('get-todos', data => {
  return new Promise(resolve => {
    request(`https://jsonplaceholder.typicode.com/todos/${data.id}`, (error, response, body) {
      if(error) {
        resolve({ error })
      } else {
        resolve(response);
      }
    });
  });
});
```

In case of an error, it's imperative that your response object has a property called .error. The
error object itself can have any custom properties.

IPCError response object looks like this:

```js
{
  type: 'IPC_ERROR',
  error: {} // error you previously resolved
}
```

# TODO

- Add CI server and how to build section
- Unit tests
