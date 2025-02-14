import React, { useState, useEffect } from 'react'
import { Bold, Italic, Code, Type, List, ListOrdered, Quote } from 'lucide-react'
import { Button } from "@/components/ui/button"
import * as Y from 'yjs';
import { v4 as uuidv4 } from 'uuid'
import { YhandletoggleStyle } from '@/controller/YdocController';
interface FloatingToolbarProps {
    blockId: string,
    onToggleType: (type: string) => void,
    ydoc: Y.Doc
}
export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ blockId, onToggleType, ydoc }) => {
    // 定义一个名为position的状态变量，初始值为{ top: 0, left: 0 }
    const [Ydoc, setYdoc] = useState(ydoc);
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

    // 定义一个名为applyStyle的函数，用于应用样式
    const applyStyle = (className: string) => {
        const selection = window.getSelection()
        const blockElement = document.getElementById(blockId)!; // 获取当前选中的块元素
        if (!selection || selection.rangeCount === 0) return
        const range = selection.getRangeAt(0)
        const blocksContent = Ydoc.getMap<Y.Text>('blocksContent');
        const startOffset = getTextOffset(blockElement, range.startContainer, range.startOffset);
        const endOffset = startOffset + range.toString().length;
        blocksContent.get(blockId)!.format(startOffset, endOffset, {
            [className]: true  // 添加样式
        });
        console.log('blocksContent', blocksContent.get(blockId)!.toDelta())
    }
    const getTextOffset = (container: Node, targetNode: Node, targetOffset: number): number => {
        let offset = 0;
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
        
        while (walker.nextNode()) {
            const node = walker.currentNode;
            if (node === targetNode) {
                return offset + targetOffset;
            }
            offset += node.textContent!.length;
        }
        
        return -1; // 未找到时返回
    };
    // 定义一个名为handleInlineStyle的函数，用于处理内联样式
    const handleInlineStyle = (style: string) => {
        switch (style) {
            case 'bold':
                applyStyle('strong')
                break
            case 'italic':
                applyStyle('em')
                break
            case 'code':
                applyStyle('bg-gray-100 px-1 rounded font-mono')
                break
            case 'heading-1':
            case 'bullet-list':
            case 'numbered-list':
            case 'quote':
                onToggleType(style)
                break
        }
    }

    // 定义一个名为removeStyle的函数，用于移除样式
    // const removeStyle = (className: string) => {
    //     const selection = window.getSelection()
    //     if (!selection || selection.rangeCount === 0) return
    //     const range = selection.getRangeAt(0)
    //     const selectedText = range.toString()
    //     const blocksContent = Ydoc.getMap<Y.Text>('blocksContent');
    //     const index = blocksContent.get(blockId)!.toString().indexOf(selectedText);
    //     console.log('removeindex', index)
    //     blocksContent.get(blockId)!.format(index, index + selectedText.length-1, {
    //         [className]: null  // 移除样式
    //     });
    //     console.log('blocksContent', blocksContent.get(blockId)!.toDelta())
    // }
    const handletoggleStyle = (style: string) => {
        setYdoc(YhandletoggleStyle(blockId,style,Ydoc))
    }
    // 定义一个名为toggleStyle的函数，用于切换样式
    const toggleStyle = (style: string) => {
        switch (style) {
            case 'bold':
                handletoggleStyle(style);
                break
            case 'italic':
                handletoggleStyle(style);
                break
            default:
                onToggleType(style)
                break
        }
    }
    
    // 如果isVisible为false，则返回null
    if (!isVisible) return null

    // 返回一个div元素，包含多个Button元素，用于切换样式
    return (
        <div
            className="fixed z-10 bg-white shadow-lg rounded-lg p-1 flex gap-1"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                transform: 'translateX(-50%)',
            }}
        >
            <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleStyle('bold')}
                className="hover:bg-gray-100"
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleStyle('italic')}
                className="hover:bg-gray-100"
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleStyle('code')}
                className="hover:bg-gray-100"
            >
                <Code className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleStyle('heading-1')}
                className="hover:bg-gray-100"
            >
                <Type className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleStyle('bullet-list')}
                className="hover:bg-gray-100"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleStyle('numbered-list')}
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
