import { MessageType } from './MessageType';

export enum SubscriptionMode {
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
}

export interface ClientModel {
  clientId: string;
  clientColor: string;
}

export interface MessageModel {
  type: MessageType;
}

export interface WelcomeMessageModel extends MessageModel {
  type: MessageType.WELCOME;
  clientId: string;
}

export interface ErrorMessageModel extends MessageModel {
  type: MessageType.ERROR;
  message: string;
}

export interface SubscriptionRequestMessageModel extends MessageModel {
  type: MessageType.SUBSCRIPTION_REQUEST;
  channel: string;
  mode: SubscriptionMode;
}

export interface SubscriptionResponseMessageModel extends MessageModel {
  type: MessageType.SUBSCRIPTION_RESPONSE;
  success: boolean;
  channel: string;
  mode: SubscriptionMode;
}

export type MessageModelType =
  | WelcomeMessageModel
  | ErrorMessageModel
  | SubscriptionRequestMessageModel
  | SubscriptionResponseMessageModel;
