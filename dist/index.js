"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const ipc_error_1 = require("./ipc_error");
const ipc_response_1 = require("./ipc_response");
const PROCESS_TYPE_MAIN = process.type === 'browser';
const PROCESS_TYPE_RENDERER = process.type === 'renderer';
class IPeeSee {
    constructor(ipc, window) {
        this.ipc = ipc;
        this.window = window;
    }
    /**
     * @param {string} channel - A channel we want to send a message to
     * @param {*} [data] - Data you want to send
     * @param {{ window?: BrowserWindow; timeout?: number; reply?: boolean }} [options]
     * @param browserWindow - A window you want to send the message to. If your application has only
     * one window, you can pass its reference to the constructor and ignore this argument further on.
     * Moreover, this parameter has higher precedence then the argument passed to the constructor, so
     * feel safe to use it in conjunction if you maybe have multiple windows but mostly communication
     * to only one of them.
     * @param timeout - An optional timeout you can specify how long you want to wait for the reply
     * before removing the listener
     * @reply - If you want to send a message without waiting for reply, set this to false
     * @returns {Promise<{}>}
     * @memberof IPeeSee
     */
    send(channel, data, options) {
        return new Promise((resolve, reject) => {
            const opts = options ? options : {};
            const window = opts.window || this.window;
            const replyChannel = this.__addReplySuffix(channel);
            let timeoutId = null;
            const shouldReply = typeof opts.reply !== 'boolean' || (typeof opts.reply === 'boolean' && opts.reply);
            if (shouldReply) {
                if (opts && opts.timeout) {
                    const timeoutDuration = opts.timeout * 1000;
                    timeoutId = setTimeout(() => {
                        this.__removeAllListeners(replyChannel);
                        resolve(new ipc_response_1.default(408, `Timed out after ${timeoutDuration * 0.001}s on channel ${replyChannel}.`));
                    }, timeoutDuration);
                }
                this.ipc.on(replyChannel, (_event, response) => {
                    clearTimeout(timeoutId);
                    this.__removeAllListeners(replyChannel);
                    if (response && Object.prototype.hasOwnProperty.call(response, 'error')) {
                        reject(new ipc_error_1.default(response.error));
                    }
                    else if (!response) {
                        resolve(new ipc_response_1.default(204, `Got an undefined reply from ${replyChannel}. This means that you are listening for a reply but not returning anything from ${replyChannel}. You should probably remove this listener and send the message one way, without waiting for the reply.`));
                    }
                    else {
                        resolve(Object.assign({}, response, new ipc_response_1.default(200)));
                    }
                });
            }
            if (PROCESS_TYPE_RENDERER) {
                const ipc = this.ipc;
                ipc.send(channel, data);
            }
            if (PROCESS_TYPE_MAIN && window && window.webContents) {
                window.webContents.on('did-finish-load', () => {
                    window.webContents.send(channel, data);
                });
            }
        });
    }
    /**
     * Adds a listener that replies to a given channel
     * @param {string} channel - A channel to listen on
     * @param {(data: any) => any} cb - To reply back, it's mandatory to return from this callback
     * @returns {() => void}
     * @memberof IPeeSee
     */
    reply(channel, cb) {
        const listener = (event, data) => __awaiter(this, void 0, void 0, function* () {
            const response = yield cb(data);
            if (PROCESS_TYPE_MAIN) {
                this.replyRenderer(event, channel, response);
            }
            if (PROCESS_TYPE_RENDERER) {
                this.__replyMain(channel, response);
            }
        });
        this.ipc.on(channel, listener);
        return () => {
            this.ipc.removeListener(channel, listener);
        };
    }
    replyRenderer(event, channel, data) {
        const window = electron_1.BrowserWindow.fromWebContents(event.sender);
        const isWindowsDestroyed = window && window.isDestroyed();
        if (!isWindowsDestroyed) {
            event.sender.send(this.__addReplySuffix(channel), data);
        }
    }
    __replyMain(channel, data) {
        const ipc = this.ipc;
        ipc.send(this.__addReplySuffix(channel), data);
    }
    __addReplySuffix(channelName) {
        return `${channelName}-reply`;
    }
    __removeAllListeners(channelName) {
        this.ipc.removeAllListeners(channelName);
    }
}
exports.default = IPeeSee;
//# sourceMappingURL=index.js.map