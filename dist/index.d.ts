import { IpcRenderer, IpcMain, BrowserWindow } from 'electron';
export default class IPeeSee {
    private ipc;
    private window;
    constructor(ipc: IpcRenderer | IpcMain, window?: BrowserWindow);
    /**
     * @param {string} channel - A channel we want to send a message to
     * @param {*} [data] - Data you want to send
     * @param {{ window?: BrowserWindow; timeout?: number; reply?: boolean }} [options]
     * @param browserWindow - A window you want to send the message to. If your application
     * has only one window, you can pass its reference to the constructor and ignore this argument
     * further on. Moreover, this parameter has higher precedence then the argument passed to the
     * constructor, so feel safe to use it in conjunction if you maybe have multiple windows but mostly
     * communication to only one of them.
     * @param timeout - An optional timeout you can specify how long you want to wait for the reply
     * before removing the listener
     * @reply - If you want to send a message without waiting for reply, set this to false
     * @returns {Promise<{}>}
     * @memberof IPeeSee
     */
    send(channel: string, data?: any, options?: {
        window?: BrowserWindow;
        timeout?: number;
        reply?: boolean;
    }): Promise<{}>;
    /**
     * Adds a listener that replies to a given channel
     * @param {string} channel - A channel to listen on
     * @param {(data: any) => any} cb - To reply back, it's mandatory to return from this callback
     * @returns {() => void}
     * @memberof IPeeSee
     */
    reply(channel: string, cb: (data: any) => any): () => void;
    private replyRenderer;
    private __replyMain;
    private __addReplySuffix;
    private __removeAllListeners;
}
