import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const WebSocket = require('ws'); // 导入 ws 库
const Y = require('yjs'); // 导入 Y.js
const WebsocketProvider = require('y-websocket').WebsocketProvider; // 导入 WebsocketProvider

// 创建一个简单的 WebSocket 服务器
const wss = new WebSocket.Server({ port: 1234 });

// WebSocket 连接处理逻辑
wss.on('connection', (ws) => {
  // console.log('Client connected');

  // 为每个客户端创建一个新的 Y.Doc 实例
  const ydoc = new Y.Doc();

  // 创建 Y.js WebSocket Provider，用于与客户端进行通信
  const provider = new WebsocketProvider('ws://localhost:1234', 'my-room', ydoc);

  // 将 WebSocket 消息转发到 Y.Doc
  ws.on('message', (message) => {
    // 这里可以添加逻辑来处理来自客户端的消息
    // console.log('Received message:', message);
  });

  // 连接关闭时清理资源
  ws.on('close', () => {
    // console.log('Client disconnected');
    provider.destroy(); // 断开连接时销毁 provider
    ydoc.destroy(); // 销毁 Y.Doc 实例
  });
});

console.log('WebSocket server started at ws://localhost:1234');
