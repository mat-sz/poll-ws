import { Client } from '../types/Client';
import {
  MessageModel,
  SubscriptionResponseMessageModel,
  WelcomeMessageModel,
  Message,
  SubscriptionMode,
  SubscriptionUpdateMessageModel,
} from '../types/Models';
import { MessageType } from '../types/MessageType';
import { Service } from 'typedi';
import { stringify } from 'querystring';

@Service()
export class ClientManagerService {
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

  handleMessage(client: Client, message: Message) {
    client.lastSeen = new Date();

    if (message.type === MessageType.SUBSCRIPTION_REQUEST) {
      let success = true;
      switch (message.mode) {
        case SubscriptionMode.SUBSCRIBE:
          client.channels.add(message.channel);
          break;
        case SubscriptionMode.UNSUBSCRIBE:
          client.channels.delete(message.channel);
          break;
        default:
          success = false;
      }

      client.send(
        JSON.stringify({
          type: MessageType.SUBSCRIPTION_RESPONSE,
          success,
          channel: message.channel,
          mode: message.mode,
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

  broadcastToChannel(channel: string, value: any) {
    const updateMessage = JSON.stringify({
      type: MessageType.SUBSCRIPTION_UPDATE,
      channel,
      value,
    } as SubscriptionUpdateMessageModel);

    this.clients.forEach(client => {
      if (client.channels.has(channel)) {
        try {
          client.send(updateMessage);
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
