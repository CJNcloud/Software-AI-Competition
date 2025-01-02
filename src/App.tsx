import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { RouterProvider } from "react-router-dom"
import { router } from "./routes"
import { useState, useEffect } from "react"

function App() {
    const [userType, setUserType] = useState<string | null>(null);
    const [userOpenId, setUserOpenId] = useState<string | null>(null);

    useEffect(() => {
        // 初始化时从 localStorage 读取登录状态
        const savedType = localStorage.getItem('userType');
        const savedOpenId = localStorage.getItem('userOpenId');
        setUserType(savedType);
        setUserOpenId(savedOpenId);

        // 添加 storage 事件监听器
        const handleStorageChange = () => {
            setUserType(localStorage.getItem('userType'));
            setUserOpenId(localStorage.getItem('userOpenId'));
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <Navbar userType={userType} userOpenId={userOpenId} />
            <RouterProvider router={router} />
        </ThemeProvider>
    );
}

export default App;

