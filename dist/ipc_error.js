"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IPCError extends Error {
    constructor(error, ...params) {
        super(...params);
        this.type = 'IPC_ERROR';
        this.error = error;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, IPCError);
        }
    }
}
exports.default = IPCError;
//# sourceMappingURL=ipc_error.js.map