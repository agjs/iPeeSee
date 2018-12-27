export default class IPCResponse {
    IPC_RESPONSE: {
        type: string;
        statusCode: number;
        message: string | null;
    };
    constructor(statusCode: number, message?: string);
}
