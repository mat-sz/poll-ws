import { Message } from './Models';

export function isMessageModel(message: any): message is Message {
  return message && 'type' in message && typeof message['type'] === 'string';
}
