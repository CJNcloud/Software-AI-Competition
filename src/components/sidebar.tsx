import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Search, ChevronDown, ChevronRight, File, Folder, Settings, Trash, Link, MessageCircle, User } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SidebarProps {
    onNewPage: () => void;
    onConnectClick: () => void;
    currentPageId: string | null;
    onWeChatLogin: () => void;
    onGuestLogin: () => void;
    isLoggedIn: boolean;
    onLogout: () => void;
}

export function Sidebar({ onNewPage, onConnectClick, currentPageId, onWeChatLogin, onGuestLogin, isLoggedIn, onLogout }: SidebarProps) {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

    const toggleFolder = (folderId: string) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev)
            if (newSet.has(folderId)) {
                newSet.delete(folderId)
            } else {
                newSet.add(folderId)
            }
            return newSet
        })
    }

    const renderItem = (item: { id: string; name: string; type: 'file' | 'folder'; children?: typeof item[] }) => {
        const isExpanded = expandedFolders.has(item.id)
        return (
            <div key={item.id} className="ml-4">
                <div className="flex items-center py-1 group">
                    {item.type === 'folder' && (
                        <Button variant="ghost" size="sm" className="p-0 h-auto" onClick={() => toggleFolder(item.id)}>
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                    )}
                    {item.type === 'file' ? <File className="h-4 w-4 mr-2" /> : <Folder className="h-4 w-4 mr-2" />}
                    <span className="flex-grow">{item.name}</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-0 h-auto opacity-0 group-hover:opacity-100">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>Rename</DropdownMenuItem>
                            <DropdownMenuItem>Move</DropdownMenuItem>
                            <DropdownMenuItem>
                                <Trash className="h-4 w-4 mr-2" />
                                <span className="text-red-500">Delete</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                {item.type === 'folder' && isExpanded && item.children && (
                    <div className="ml-4">
                        {item.children.map(child => renderItem(child))}
                    </div>
                )}
            </div>
        )
    }

    const dummyData = [
        {
            id: '1',
            name: 'Work',
            type: 'folder' as const,
            children: [
                { id: '2', name: 'Project A', type: 'file' as const },
                { id: '3', name: 'Project B', type: 'file' as const },
            ],
        },
        {
            id: '4',
            name: 'Personal',
            type: 'folder' as const,
            children: [
                { id: '5', name: 'Journal', type: 'file' as const },
                { id: '6', name: 'Travel Plans', type: 'file' as const },
            ],
        },
    ]

    const handleLogout = () => {
        // 清除所有登录相关的数据
        localStorage.removeItem('userOpenId');
        localStorage.removeItem('userType');
        
        // 调用传入的 onLogout 回调
        if (onLogout) {
            onLogout();
        }
    };

    return (
        <div className="w-64 h-full bg-background border-r flex flex-col">
            <div className="p-4 flex-shrink-0">
                {isLoggedIn ? (
                    <div className="space-y-2">
                        <Button 
                            className="w-full justify-start" 
                            onClick={onNewPage}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" /> New Page
                        </Button>
                        <Button 
                            variant="outline"
                            className="w-full justify-start"
                            onClick={onConnectClick}
                        >
                            <Link className="mr-2 h-4 w-4" /> Connect to Page
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Button
                            className="w-full justify-start"
                            onClick={onWeChatLogin}
                        >
                            <MessageCircle className="mr-2 h-4 w-4" /> 微信登录
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={onGuestLogin}
                        >
                            <User className="mr-2 h-4 w-4" /> 游客登录
                        </Button>
                    </div>
                )}
                <div className="relative mt-4">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-8" placeholder="Search" />
                </div>
            </div>
            <div className="mt-4 flex-grow overflow-y-auto">
                {currentPageId && dummyData.map(item => renderItem(item))}
            </div>
            <div className="p-4 border-t flex-shrink-0">
                {isLoggedIn ? (
                    <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={handleLogout}
                    >
                        <Settings className="mr-2 h-4 w-4" /> 退出登录
                    </Button>
                ) : (
                    <Button variant="outline" className="w-full justify-start">
                        <Settings className="mr-2 h-4 w-4" /> Settings
                    </Button>
                )}
            </div>
        </div>
    )
}

