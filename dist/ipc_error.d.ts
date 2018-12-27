export default class IPCError extends Error {
    type: string;
    error: IPCError;
    constructor(error: any, ...params: any);
}
