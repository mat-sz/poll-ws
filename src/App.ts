import 'reflect-metadata';
import {
  useContainer as useContainerRC,
  useKoaServer,
} from 'routing-controllers';
import { Container, Service } from 'typedi';
import Koa from 'koa';
import websockify from 'koa-websocket';

import { WSClient } from './WSClient';
import { ClientManagerService } from './services/ClientManagerService';
import { isMessageModel } from './types/typeChecking';
import { PollController } from './controllers/PollController';

// Configuration
const host = process.env.APP_HOST || '127.0.0.1';
const httpPort = parseInt(process.env.APP_PORT) || 5000;
const proxy =
  process.env.APP_BEHIND_PROXY === 'true' ||
  process.env.APP_BEHIND_PROXY === 'yes';

export default async function App() {
  useContainerRC(Container);

  try {
    const app = websockify(new Koa(), {
      path: '/ws',
    });
    app.proxy = proxy;

    const clientManager = Container.get(ClientManagerService);

    app.ws.use((ctx, next) => {
      const ws = ctx.websocket;
      const client = new WSClient(ws, ctx);
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

      next();
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

    // HTTP
    const rc = useKoaServer(app, {
      cors: true,
      controllers: [PollController],
      middlewares: [],
      defaultErrorHandler: true,
    });

    app.listen(httpPort, host);

    console.log('Listening on: ' + host + ':' + httpPort);
  } catch (e) {
    console.error(e);
  }
}
