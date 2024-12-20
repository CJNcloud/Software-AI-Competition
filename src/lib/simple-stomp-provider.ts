import { Client } from '@stomp/stompjs'
import * as Y from 'yjs'

type EventCallback = (isSynced: boolean) => void;

export class SimpleStompProvider {
    private pageId: string;
    private doc: Y.Doc;
    private stompClient: Client;
    private eventHandlers: Map<string, EventCallback[]>;
    private synced: boolean = false;

    constructor(serverUrl: string, pageId: string, doc: Y.Doc) {
        this.pageId = pageId;
        this.doc = doc;
        this.eventHandlers = new Map();

        this.stompClient = new Client({
            brokerURL: serverUrl,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000
        });

        this.stompClient.onConnect = () => {
            console.log(`STOMP Connected to page ${this.pageId}`);

            this.stompClient.subscribe(`/topic/page/${this.pageId}`, message => {
                console.log(`Received update for page ${this.pageId}:`, message);
                const data = JSON.parse(message.body);
                if (data.clientId !== this.doc.clientID) {
                    const update = new Uint8Array(data.update);
                    Y.applyUpdate(this.doc, update, 'remote');
                }
            });

            this.synced = true;
            this.emit('sync', true);
        };

        this.stompClient.onDisconnect = () => {
            this.synced = false;
            this.emit('sync', false);
        };

        this.doc.on('update', (update: Uint8Array, origin: any) => {
            if (this.stompClient.connected && origin !== 'remote') {
                console.log('发送了某更新'+update);
                this.stompClient.publish({
                    destination: `/app/page/${this.pageId}`,
                    body: JSON.stringify({
                        update: Array.from(update),
                        clientId: this.doc.clientID
                    })
                });
            }
        });

        this.stompClient.activate();
    }

    // 添加事件监听器
    on(eventName: string, callback: EventCallback) {
        if (!this.eventHandlers.has(eventName)) {
            this.eventHandlers.set(eventName, []);
        }
        this.eventHandlers.get(eventName)?.push(callback);

        // 如果是 sync 事件，并且已经同步完成，立即触发回调
        if (eventName === 'sync' && this.synced) {
            callback(true);
        }
    }

    // 移除事件监听器
    off(eventName: string, callback: EventCallback) {
        const handlers = this.eventHandlers.get(eventName);
        if (handlers) {
            const index = handlers.indexOf(callback);
            if (index !== -1) {
                handlers.splice(index, 1);
            }
        }
    }

    // 触发事件
    private emit(eventName: string, ...args: any[]) {
        const handlers = this.eventHandlers.get(eventName);
        if (handlers) {
            handlers.forEach(handler => handler(...args));
        }
    }

    destroy() {
        if (this.stompClient) {
            this.stompClient.deactivate();
        }
        this.eventHandlers.clear();
    }
}