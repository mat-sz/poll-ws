import { MessageModelType } from './Models';

export function isMessageModel(message: any): message is MessageModelType {
  return message && 'type' in message && typeof message['type'] === 'string';
}
