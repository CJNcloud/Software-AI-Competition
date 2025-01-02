import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import LogoImage from '@/images/logo.png';
import ProgramImage from '@/images/program.png';

interface NavbarProps {
    userType: string | null;
    userOpenId: string | null;
}

export function Navbar({ userType, userOpenId }: NavbarProps) {
    const isLoggedIn = !!(userType && userOpenId);

    return (
        <nav className="border-b">
            <div className="flex h-16 items-center px-4">
                <Button variant="ghost" className="text-xl font-bold flex items-center gap-3">
                    <img
                        src={ProgramImage}
                        alt="Ideai Logo"
                        className="w-12 h-12 object-contain"
                    />
                    <img
                        src={LogoImage}
                        alt="Ideai Logo"
                        className="w-12 h-12 object-contain"
                    />
                </Button>
                <div className="ml-auto flex items-center space-x-4">
                    {isLoggedIn && (
                        <span className="text-sm text-muted-foreground">
                            {userType === 'guest' ? '游客模式' : '微信用户'}
                        </span>
                    )}
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search..."
                            className="pl-8 md:w-[300px] lg:w-[400px]"
                        />
                    </div>
                    <ModeToggle />
                </div>
            </div>
        </nav>
    )
}
