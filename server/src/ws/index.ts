import type { WebSocket as WsWebSocket } from 'ws';

interface ClientConnection {
  ws: WsWebSocket;
  isAlive: boolean;
}

const clients: Set<ClientConnection> = new Set();

export function handleConnection(ws: WsWebSocket): void {
  const client: ClientConnection = { ws, isAlive: true };
  clients.add(client);

  console.log(`[WS] Client connected. Total: ${clients.size}`);

  ws.on('pong', () => {
    client.isAlive = true;
  });

  ws.on('close', () => {
    clients.delete(client);
    console.log(`[WS] Client disconnected. Total: ${clients.size}`);
  });

  ws.on('error', (err) => {
    console.error('[WS] Client error:', err.message);
    clients.delete(client);
  });
}

export function broadcast(msg: { type: string; data: unknown }): void {
  const data = JSON.stringify(msg);
  for (const client of clients) {
    if (client.ws.readyState === 1) {
      client.ws.send(data);
    }
  }
}

// 心跳检测
setInterval(() => {
  for (const client of Array.from(clients)) {
    if (!client.isAlive) {
      client.ws.terminate();
      clients.delete(client);
      continue;
    }
    client.isAlive = false;
    client.ws.ping();
  }
}, 30000);
