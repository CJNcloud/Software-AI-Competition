import  { useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button"

interface WeChatLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (openId: string) => void;
}

export function WeChatLoginModal({ isOpen, onClose, onLoginSuccess }: WeChatLoginModalProps) {
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 3;

    const connectWebSocket = useCallback(() => {
        try {
            console.log('尝试建立WebSocket连接...');
            const websocket = new WebSocket('ws://forfries.com:8886/wxlogin');
            
            websocket.onopen = () => {
                console.log('WebSocket连接已建立');
                setError(null);
                setRetryCount(0);
            };

            websocket.onmessage = (event) => {
                console.log('收到消息:', event.data);
                const message = event.data;
                if (message.startsWith('http')) {
                    setQrCodeUrl(message);
                } else if (message.includes('openID:')) {
                    const openId = message.match(/openID:([^,]+)/)?.[1];
                    if (openId) {
                        onLoginSuccess(openId);
                        onClose();
                    }
                }
            };

            websocket.onerror = (error) => {
                console.error('WebSocket错误:', error);
                setError('连接出错，正在重试...');
                websocket.close();
            };

            websocket.onclose = () => {
                console.log('WebSocket连接已关闭');
                // 如果不是主动关闭，且重试次数未达上限，则尝试重新连接
                if (isOpen && retryCount < MAX_RETRIES) {
                    console.log(`尝试重新连接... (${retryCount + 1}/${MAX_RETRIES})`);
                    setRetryCount(prev => prev + 1);
                    setTimeout(() => connectWebSocket(), 2000); // 2秒后重试
                } else if (retryCount >= MAX_RETRIES) {
                    setError('连接失败，请刷新页面重试');
                }
            };

            setWs(websocket);
        } catch (err) {
            console.error('创建WebSocket时出错:', err);
            setError('连接出错，请检查网络后重试');
        }
    }, [isOpen, onClose, onLoginSuccess, retryCount]);

    useEffect(() => {
        if (isOpen) {
            connectWebSocket();
        }
        return () => {
            if (ws) {
                ws.close();
                setWs(null);
            }
        };
    }, [isOpen, connectWebSocket]);

    const handleRetry = () => {
        setError(null);
        setRetryCount(0);
        setQrCodeUrl(null);
        connectWebSocket();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-card p-6 rounded-lg shadow-lg w-[350px]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">微信登录</h2>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex flex-col items-center">
                    {error ? (
                        <div className="text-center">
                            <div className="text-destructive mb-4">{error}</div>
                            <Button 
                                onClick={handleRetry}
                                variant="outline"
                                className="mt-2"
                            >
                                重试连接
                            </Button>
                        </div>
                    ) : qrCodeUrl ? (
                        <>
                            <img
                                src={qrCodeUrl}
                                alt="微信登录二维码"
                                className="w-64 h-64 mb-4"
                            />
                            <p className="text-sm text-muted-foreground">
                                请使用微信扫描二维码登录
                            </p>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                            <p className="text-sm text-muted-foreground">
                                正在加载二维码...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 