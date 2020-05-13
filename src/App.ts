import 'reflect-metadata';
import {
  createKoaServer,
  useContainer as useContainerRC,
} from 'routing-controllers';
import { Container } from 'typedi';
import WebSocket from 'ws';

import { WSClient } from './WSClient';
import { ClientManager } from './ClientManager';
import { isMessageModel } from './types/typeChecking';
import { PollController } from './controllers/PollController';

// Configuration
const host = process.env.WS_HOST || '127.0.0.1';
const httpPort = parseInt(process.env.WS_PORT) || 5000;
const wsPort = parseInt(process.env.HTTP_PORT) || 8080;

export default async function App() {
  useContainerRC(Container);

  try {
    const wss = new WebSocket.Server({ host: host, port: wsPort });

    const clientManager = new ClientManager();

    wss.on('connection', (ws, req) => {
      const client = new WSClient(ws, req);
      clientManager.addClient(client);

      ws.on('message', (data: string) => {
        // Prevents DDoS and abuse.
        if (!data || data.length > 1024) return;

        try {
          const message = JSON.parse(data);

          if (isMessageModel(message)) {
            clientManager.handleMessage(client, message);
          }
        } catch (e) {}
      });

      ws.on('close', () => {
        clientManager.removeClient(client);
      });
    });

    setInterval(() => {
      clientManager.removeBrokenClients();
    }, 1000);

    // Ping clients to keep the connection alive (when behind nginx)
    setInterval(() => {
      clientManager.pingClients();
    }, 5000);

    setInterval(() => {
      clientManager.removeInactiveClients();
    }, 10000);

    console.log('[WS] listening on: ' + host + ':' + wsPort);

    // HTTP
    const app = createKoaServer({
      cors: true,
      controllers: [PollController],
      middlewares: [],
      defaultErrorHandler: true,
    });

    app.listen(httpPort, host);

    console.log('[HTTP] listening on: ' + host + ':' + httpPort);
  } catch (e) {
    console.error(e);
  }
}
