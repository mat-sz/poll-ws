import { Client } from './types/Client';
import {
  MessageModel,
  SubscriptionResponseMessageModel,
  WelcomeMessageModel,
  MessageModelType,
} from './types/Models';
import { MessageType } from './types/MessageType';

export class ClientManager {
  private clients: Client[] = [];

  addClient(client: Client) {
    this.clients.push(client);

    client.send(
      JSON.stringify({
        type: MessageType.WELCOME,
        clientId: client.clientId,
      } as WelcomeMessageModel)
    );
  }

  handleMessage(client: Client, message: MessageModelType) {
    client.lastSeen = new Date();

    if (message.type === MessageType.SUBSCRIPTION_REQUEST) {
      if (!client.channels.includes(message.channel)) {
        client.channels.push(message.channel);
      }

      client.send(
        JSON.stringify({
          type: MessageType.SUBSCRIPTION_RESPONSE,
          success: true,
          channel: message.channel,
        } as SubscriptionResponseMessageModel)
      );
    }
  }

  broadcast(message: MessageModel) {
    const networkMessage = JSON.stringify(message);

    this.clients.forEach(client => {
      try {
        client.send(networkMessage);
      } catch {}
    });
  }

  broadcastToChannel(channel: string, message: MessageModel) {
    const networkMessage = JSON.stringify(message);

    this.clients.forEach(client => {
      if (client.channels.includes(channel)) {
        try {
          client.send(networkMessage);
        } catch {}
      }
    });
  }

  pingClients() {
    const pingMessage = JSON.stringify({
      type: MessageType.PING,
      timestamp: new Date().getTime(),
    });

    this.clients.forEach(client => {
      if (client.readyState !== 1) return;

      try {
        client.send(pingMessage);
      } catch {
        this.removeClient(client);
        client.close();
      }
    });
  }

  removeClient(client: Client) {
    this.clients = this.clients.filter(c => c !== client);
  }

  removeBrokenClients() {
    this.clients = this.clients.filter(client => {
      if (client.readyState <= 1) {
        return true;
      } else {
        return false;
      }
    });
  }

  removeInactiveClients() {
    const minuteAgo = new Date(Date.now() - 1000 * 20);

    this.clients.forEach(client => {
      if (client.readyState !== 1) return;

      if (client.lastSeen < minuteAgo) {
        this.removeClient(client);
        client.close();
      }
    });
  }
}
