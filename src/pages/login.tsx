import { WeChatLoginModal } from "@/components/WeChatLoginModal"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

export default function Login() {
    const navigate = useNavigate();
    const [showWeChatLoginModal, setShowWeChatLoginModal] = useState(true);
    
    const handleLoginSuccess = (openId: string) => {
        // 存储登录状态
        localStorage.setItem('userOpenId', openId);
        localStorage.setItem('userType', 'Wxlogin');
        
        // 触发自定义事件通知其他组件登录状态已更新
        window.dispatchEvent(new Event('storage'));
        
        // 登录成功后跳转到首页
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-background">
            <WeChatLoginModal
                isOpen={showWeChatLoginModal}
                onClose={() => navigate('/')}
                onLoginSuccess={handleLoginSuccess}
            />
        </div>
    );
} 