"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IPCResponse {
    constructor(statusCode, message) {
        this.IPC_RESPONSE = {
            type: 'IPC_RESPONSE',
            statusCode: statusCode,
            message: message ? message : null,
        };
    }
}
exports.default = IPCResponse;
//# sourceMappingURL=ipc_response.js.map