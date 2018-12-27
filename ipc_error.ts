export default class IPCError extends Error {
  public type: string;
  public error: IPCError;
  constructor(error: any, ...params: any) {
    super(...params);
    this.type = 'IPC_ERROR';
    this.error = error;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, IPCError);
    }
  }
}
