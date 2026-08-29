import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";

let stompClient: Client | null = null;

export function connectSocket() {
  if (stompClient) {
    return stompClient;
  }

  stompClient = new Client({
    brokerURL: import.meta.env.VITE_WS_URL,
    reconnectDelay: 5000,
    debug: () => {},
  });

  stompClient.onConnect = () => {};

  stompClient.onStompError = (frame) => {
    console.error("STOMP error:", frame);
  };

  stompClient.onWebSocketError = (event) => {
    console.error("WebSocket error:", event);
  };

  return stompClient;
}

export function activateSocket() {
  const client = connectSocket();

  if (!client.active) {
    client.activate();
  }

  return client;
}

export function subscribeSessionTopic(
  sessionId: number,
  onMessage: (message: IMessage) => void,
): StompSubscription | null {
  if (!stompClient || !stompClient.connected) {
    return null;
  }

  return stompClient.subscribe(`/topic/session/${sessionId}`, onMessage);
}
