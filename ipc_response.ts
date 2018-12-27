export default class IPCResponse {
  public IPC_RESPONSE: { type: string; statusCode: number; message: string | null };
  constructor(statusCode: number, message?: string) {
    this.IPC_RESPONSE = {
      type: 'IPC_RESPONSE',
      statusCode: statusCode,
      message: message ? message : null,
    };
  }
}
