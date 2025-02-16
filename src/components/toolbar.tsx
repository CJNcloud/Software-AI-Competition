import React, { useState, useEffect } from 'react'
import { Bold, Italic, Code, Type, List, ListOrdered, Quote } from 'lucide-react'
import { Button } from "@/components/ui/button"
interface FloatingToolbarProps {
    blockId: string,
    onApplyStyle: (blockid:string,style: string) => void,
}
export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ blockId, onApplyStyle }) => {
    // 定义一个名为position的状态变量，初始值为{ top: 0, left: 0 }
    const [position, setPosition] = useState({ top: 0, left: 0 })
    // 定义一个名为isVisible的状态变量，初始值为false
    const [isVisible, setIsVisible] = useState(false)

    // 使用useEffect钩子函数，监听selectionchange事件，更新position和isVisible的值
    useEffect(() => {
        const updatePosition = () => {
            const selection = window.getSelection()
            if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
                const range = selection.getRangeAt(0)
                const rect = range.getBoundingClientRect()
                setPosition({
                    top: rect.top + window.scrollY - 40,
                    left: rect.left + rect.width / 2,
                })
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        document.addEventListener('selectionchange', updatePosition)
        return () => document.removeEventListener('selectionchange', updatePosition)
    }, [blockId])

    // 定义一个名为applyStyle的函数，用于应用样
    // 定义一个名为handleInlineStyle的函数，用于处理内联样式
    const handleInlineStyle = (style: string) => {
        switch (style) {
            case 'bold':
                onApplyStyle(blockId,'bold')
                break
            case 'italic':
                onApplyStyle(blockId,'italic')
                break
            case 'code':
                onApplyStyle(blockId,'bg-gray-100 px-1 rounded font-mono')
                break
            case 'heading-1':
            case 'bullet-list':
            case 'numbered-list': 
                break
        }
    }
    // 定义一个名为handleInlineStyle的函数，用于切换样式
    
    // 如果isVisible为false，则返回null
    if (!isVisible) return null

    // 返回一个div元素，包含多个Button元素，用于切换样式
    return (
        <div
            className="fixed z-10 bg-white dark:bg-black shadow-lg rounded-lg p-1 flex gap-1"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                transform: 'translateX(-50%)',
            }}
        >
            <Button
                variant="ghost"
                size="sm"
                onClick={() => handleInlineStyle('bold')}
                className="hover:bg-gray-100"
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => handleInlineStyle('italic')}
                className="hover:bg-gray-100"
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => handleInlineStyle('code')}
                className="hover:bg-gray-100"
            >
                <Code className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => handleInlineStyle('heading-1')}
                className="hover:bg-gray-100"
            >
                <Type className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => handleInlineStyle('bullet-list')}
                className="hover:bg-gray-100"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => handleInlineStyle('numbered-list')}
                className="hover:bg-gray-100"
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => handleInlineStyle('quote')}
                className="hover:bg-gray-100"
            >
                <Quote className="h-4 w-4" />
            </Button>
        </div>
    )
}
