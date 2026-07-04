import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { networkInterfaces } from 'os';
import apiRouter from './routes/index.js';
import { handleConnection, broadcast } from './ws/index.js';
import { getConfig, watchConfig } from './config/index.js';
import { setBroadcastFn } from './routes/index.js';
import type { WsMessage } from '../../shared/types/index';

const app = express();
const config = getConfig();

// 中间件
app.use(cors());
app.use(express.json());

// API 路由
app.use('/api', apiRouter);

// 静态文件（生产环境）
app.use(express.static('../client/dist'));

// HTTP 服务器
const server = createServer(app);

// WebSocket 服务器（允许跨域连接）
const wss = new WebSocketServer({
  server,
  path: '/ws',
  verifyClient: (_info, callback) => {
    callback(true);
  },
});

wss.on('connection', (ws) => {
  handleConnection(ws);
});

// 设置广播函数
setBroadcastFn((msg: WsMessage) => broadcast(msg));

// 配置文件热重载
watchConfig((newConfig) => {
  broadcast({
    type: 'system:info' as any,
    data: { message: 'Configuration reloaded', config: newConfig },
  });
});

// 获取本机局域网 IP
function getLocalIP(): string {
  const interfaces = networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

// 启动服务器
const PORT = config.server.port;
server.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║         DeskHub Server Started       ║');
  console.log('  ╠══════════════════════════════════════╣');
  console.log(`  ║  Local:   http://localhost:${PORT}      ║`);
  console.log(`  ║  Network: http://${localIP}:${PORT}    ║`);
  console.log('  ║                                      ║');
  console.log('  ║  Open the Network URL on your        ║');
  console.log('  ║  phone/tablet to start controlling    ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
});
