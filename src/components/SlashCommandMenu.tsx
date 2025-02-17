//在Block中输入任意的字符实现一些功能

import React from 'react'
import { Text, Heading1, Heading2, Heading3, Image as ImageIcon } from 'lucide-react'

interface SlashCommandMenuProps {
    position: { x: number; y: number }
    onSelect: (type: string) => void
    onClose: () => void
}

const commands = [
    { type: 'paragraph', icon: Text, label: 'Text' },
    { type: 'image', icon: ImageIcon, label: 'Image' },
]

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({ position, onSelect, onClose }) => {
    return (
        <div
            className="fixed z-20 bg-white dark:bg-black shadow-lg rounded-lg p-2 w-64"
            style={{
                top: `${position.y}px`,
                left: `${position.x}px`,
            }}
        >
            {commands.map((command) => (
                <button
                    key={command.type}
                    className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-left"
                    onClick={() => {
                        onSelect(command.type)
                        onClose()
                    }}
                >
                    <command.icon className="h-4 w-4" />
                    <span>{command.label}</span>
                </button>
            ))}
        </div>
    )
}

