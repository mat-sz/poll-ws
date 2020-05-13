import { v4 as uuid } from 'uuid';
import { Context } from 'koa';
import WebSocket from 'ws';

import { Client } from './types/Client';

export class WSClient implements Client {
  readonly clientId = uuid();
  readonly firstSeen = new Date();
  lastSeen = new Date();
  readonly remoteAddress: string;
  channels = new Set<string>();

  constructor(private ws: WebSocket, ctx: Context) {
    const address = ctx.ip;
    this.remoteAddress = Array.isArray(address) ? address[0] : address;
  }

  send(data: string) {
    if (this.ws.readyState !== 1) {
      return;
    }

    this.ws.send(data);
  }

  get readyState() {
    return this.ws.readyState;
  }

  close() {
    this.ws.close();
  }
}
