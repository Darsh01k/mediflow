import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import { useAuth } from '../context/AuthContext';

/**
 * Hook that connects to the STOMP WebSocket notification endpoint and provides
 * real-time notification updates. Uses STOMP over SockJS for maximum
 * browser compatibility.
 *
 * @param {Function} onNotificationReceived - Callback when a new notification arrives
 * @param {boolean} enabled - Whether the connection should be active
 */
export function useNotificationWebSocket(onNotificationReceived, enabled = true) {
  const { user, token } = useAuth();
  const clientRef = useRef(null);
  const callbackRef = useRef(onNotificationReceived);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = onNotificationReceived;
  }, [onNotificationReceived]);

  useEffect(() => {
    if (!enabled || !user || !token) {
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    // WebSocket endpoint is the base URL without /api suffix
    const baseUrl = apiUrl.replace(/\/api\/?$/, '');
    const wsUrl = `${baseUrl}/ws/notifications`;

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        // Subscribe to user-specific notification queue
        // The server sends to /user/{userId}/notifications,
        // and STOMP translates this to /user/queue/notifications for the client
        client.subscribe(`/user/${user.userId}/notifications`, (message) => {
          try {
            const notification = JSON.parse(message.body);
            if (callbackRef.current) {
              callbackRef.current(notification);
            }
          } catch (err) {
            console.error('Failed to parse notification message:', err);
          }
        });
      },
      onDisconnect: () => {
        // Will auto-reconnect via STOMP client
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message']);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [enabled, user, token]);

  return {
    isConnected: clientRef.current?.connected || false,
  };
}
