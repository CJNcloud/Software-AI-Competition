import React, {useEffect, useRef, useState, useCallback} from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { Trash2, GripVertical } from 'lucide-react'
import { cn } from "@/lib/utils"
interface BlockProps {
    id: string
    type: string
    content: string
    onChange: (id: string, content: string) => void
    onFocus: (id: string) => void
    onBlur: (id: string|null) => void
    onKeyDown: (e: React.KeyboardEvent, id: string) => void
    onDelete: (id: string) => void
    onToggleType: (id: string, type: string) => void
    index: number
    moveBlock: (DragIndex: number, HoverIndex:  number) => void
    awareness?: any;
    userId: string;
    selectedBlockId: string | null;
    placeholder?: string;
    isSelected: boolean;
    onSelect: (id: string, e: MouseEvent) => void;
}

interface DragItem {
    id: string
    type: string
    index:number
}

export const Block: React.FC<BlockProps> = ({
                                                id,
                                                type,
                                                content,
                                                onChange,
                                                onFocus,
                                                onBlur,
                                                onKeyDown,
                                                onDelete,
                                                // onToggleType,
                                                index,
                                                moveBlock,
                                                awareness,
                                                userId,
                                                selectedBlockId,
                                                placeholder = "按下 / 开始创作",
                                                isSelected,
                                                onSelect,
                                            }) => {
    const ref = useRef<HTMLDivElement>(null)
    const divRef = useRef<HTMLDivElement | null>(null);
    const lastSelectionRef = useRef<{offset: number} | null>(null);

    useEffect(() => {
        if (!awareness) return;

        const handleAwarenessChange = () => {
            const states = awareness.getStates();
            states.forEach((state: any) => {
                if (state.user.id !== userId && state.user.cursor?.blockId === id) {
                    // 如果有其他用户的光标在这个块中，可以显示他们的光标位置
                    // 这里可以添加显示其他用户光标的逻辑
                }
            });
        };

        awareness.on('change', handleAwarenessChange);
        return () => awareness.off('change', handleAwarenessChange);
    }, [awareness, id, userId]);

    const saveSelection = () => {
        const selection = window.getSelection();
        if (!selection || !divRef.current) return;

        const range = selection.getRangeAt(0);
        if (divRef.current.contains(range.startContainer)) {
            lastSelectionRef.current = {
                offset: range.startOffset
            };
        }
    };

    const restoreSelection = useCallback(() => {
        if (!lastSelectionRef.current || !divRef.current) return;

        const selection = window.getSelection();
        if (!selection) return;

        const range = document.createRange();
        const textNode = divRef.current.firstChild || divRef.current;
        
        try {
            range.setStart(textNode, lastSelectionRef.current.offset);
            range.setEnd(textNode, lastSelectionRef.current.offset);
            selection.removeAllRanges();
            selection.addRange(range);
        } catch (e) {
            console.warn('Failed to restore selection:', e);
        }
    }, []);

    useEffect(() => {
        const div = divRef.current;
        if (!div) return;

        const handleInput = () => {
            saveSelection();
            if (awareness) {
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    awareness.setLocalState({
                        user: {
                            id: userId,
                            cursor: {
                                blockId: id,
                                offset: range.startOffset
                            }
                        }
                    });
                }
            }
        };

        div.addEventListener('input', handleInput);
        return () => div.removeEventListener('input', handleInput);
    }, [awareness, id, userId]);

    useEffect(() => {
        if (content) {
            restoreSelection();
        }
    }, [content, restoreSelection]);

    const [isHovered, setIsHovered] = useState(false)

    const [{ isDragging }, drag, dragPreview] = useDrag({
        type: 'BLOCK',
        item: (): DragItem => ({
            id,
            type: 'BLOCK',
            index,
        }),
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    })

    const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>({
        accept: 'BLOCK',
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
        hover: (item, monitor) => {
            if (!ref.current) {
                return
            }
    
            const dragIndex = item.index
            const hoverIndex = index
    
            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return
            }
    
            // Determine rectangle on screen
            const hoverBoundingRect = ref.current.getBoundingClientRect()
    
            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
    
            // Determine mouse position
            const clientOffset = monitor.getClientOffset()
            if (!clientOffset) {
                return
            }
    
            // Get pixels to the top
            const hoverClientY = clientOffset.y - hoverBoundingRect.top
    
            // Only perform the move when the mouse has crossed half of the items height
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return
            }
    
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return
            }
    
            // Don't perform any move until mouse is dropped (this ensures we don't update prematurely)
        },
        drop: (item) => {
            const dragIndex = item.index
            const hoverIndex = index
            // Only perform the move when the drag has ended (mouse is dropped)
            if (dragIndex !== hoverIndex) {
                moveBlock(dragIndex, hoverIndex)
            }
        },
    })

    // Initialize drag preview         
    useEffect(() => {
        dragPreview(drop(ref))
    }, [dragPreview, drop])

    const getBlockStyle = () => {
        switch (type) {
            case 'heading-1':
                return 'text-4xl font-bold'
            case 'heading-2':
                return 'text-3xl font-semibold'
            case 'heading-3':
                return 'text-2xl font-medium'
            case 'bullet-list':
                return 'list-disc list-inside'
            case 'numbered-list':
                return 'list-decimal list-inside'
            case 'code':
                return 'bg-gray-100 p-2 rounded font-mono'
            case 'quote':
                return 'border-l-4 border-gray-300 pl-4 italic'
            default:
                return ''
        }
    }

    useEffect(() => {
        if (selectedBlockId === id && divRef.current) {
            divRef.current.focus();
            
            // 确保元素中有内容节点
            if (!divRef.current.firstChild) {
                divRef.current.appendChild(document.createTextNode(''));
            }
            
            // 将光标移动到内容末尾
            const selection = window.getSelection();
            const range = document.createRange();
            const textNode = divRef.current.firstChild || divRef.current;
            
            try {
                // 如果是文本节点，使用其长度；否则使用 0
                const length = textNode.nodeType === Node.TEXT_NODE ? 
                    textNode.textContent?.length || 0 : 0;
                
                range.setStart(textNode, length);
                range.setEnd(textNode, length);
                
                selection?.removeAllRanges();
                selection?.addRange(range);
                
                // 确保视图滚动到光标位置
                const rect = range.getBoundingClientRect();
                if (rect) {
                    divRef.current.scrollIntoView({ block: 'nearest' });
                }
            } catch (e) {
                console.warn('Failed to set cursor position:', e);
            }
        }
    }, [id, selectedBlockId, content]);

    // 添加一个处理输入的函数
    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        const content = e.currentTarget.innerHTML;
        // 如果内容只包含 <br> 或者为空，则将内容设置为空字符串
        if (content === '<br>' || content === '&nbsp;' || content === '') {
            e.currentTarget.innerHTML = '';
            onChange(id, '');
        } else {
            onChange(id, content);
        }
    };

    // 添加一个处理键盘事件的函数
    const handleKeyDownInternal = (e: React.KeyboardEvent<HTMLDivElement>) => {
        // 如果内容为空且按下了退格键
        if (e.key === 'Backspace' && divRef.current) {
            const content = divRef.current.innerHTML;
            if (content === '<br>' || content === '&nbsp;' || content === '') {
                e.preventDefault();
                divRef.current.innerHTML = '';
                onKeyDown(e, id);
            } else {
                // 检查是否正在删除 "/"
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const start = range.startOffset;
                    if (start === 1 && content.startsWith('/')) {
                        // 如果正在删除 "/"，触发关闭菜单的事件
                        const customEvent = new KeyboardEvent('keydown', {
                            key: 'Escape',
                            bubbles: true
                        });
                        e.currentTarget.dispatchEvent(customEvent);
                    }
                }
            }
        }
        onKeyDown(e, id);
    };

    return (
        <div
            ref={ref}
            className="group relative pl-8"
            onClick={(e) => onSelect(id, e.nativeEvent)}
            data-block-id={id}
        >
            <div
                className={cn(
                    "relative mb-1 transition-all duration-100",
                    isOver && "border-t-2 border-blue-500",
                    isDragging && "opacity-50",
                    isSelected && "bg-blue-100 dark:bg-blue-900/30",
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div
                    ref={drag}
                    className={cn(
                        "absolute left-0 top-1/2 transform -translate-y-1/2 cursor-move",
                        "w-6 h-6 flex items-center justify-center",
                        "hover:bg-gray-100 rounded",
                        "-translate-x-8",
                        "opacity-0 group-hover:opacity-100 transition-opacity"
                    )}
                >
                    <GripVertical className="h-4 w-4 text-gray-400" />
                </div>
                
                <div
                    ref={divRef}
                    contentEditable
                    suppressContentEditableWarning
                    className={cn(
                        "min-h-[1.5em] p-1 rounded outline-none",
                        "focus:bg-gray-50 dark:focus:bg-gray-800",
                        selectedBlockId === id ? (
                            "empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
                        ) : (
                            "empty:before:content-none"
                        ),
                        "empty:before:pointer-events-none empty:before:h-0 empty:before:float-left",
                        getBlockStyle()
                    )}
                    data-placeholder={placeholder}
                    onInput={handleInput}
                    onFocus={() => onFocus(id)}
                    onBlur={() => onBlur(id)}
                    onKeyDown={handleKeyDownInternal}
                >
                    {content}
                </div>

                <button
                    className={cn(
                        "absolute top-1 right-1",
                        "opacity-0 group-hover:opacity-50 hover:!opacity-100",
                        "transition-opacity"
                    )}
                    onClick={() => onDelete(id)}
                >
                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
            </div>
        </div>
    )
}

