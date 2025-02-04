import React, {useEffect, useRef, useState, useCallback} from 'react'
import { Trash2, GripVertical } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useDragBlock } from '@/hooks/useDragBlock'
import { TextBlockProps } from './BlockInterface/Block' 
import { StyledContent } from '../StyledContent'
export const TextBlock: React.FC<TextBlockProps> = ({
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
                                                placeholder = "按下 / 开始创作",
                                                isSelected,
                                                onSelect,
                                                style,
                                            }) => {
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
    }, [awareness, id, userId]);//处理不同用户输入
    useEffect(() => {
        if (content) {
            restoreSelection();//每次输入都要处理一次返回光标,待优化
        }
    }, [content, restoreSelection]);
    useEffect(() => {
        // console.log(JSON.stringify(style));
        console.log('style',style);
    },[style])
    const {setIsHovered , ref, drag, isDragging, isOver}= useDragBlock(id, index, moveBlock);
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
    // 添加一个处理输入的函数
    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        const content = e.currentTarget.textContent!;
        // 如果内容只包含 <br> 或者为空，则将内容设置为空字符串
        onChange(id, content);
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
            {/* 创建一个div，ref属性绑定到ref变量，className属性绑定到"group relative pl-8"，onClick属性绑定到onSelect函数，data-block-id属性绑定到id */}
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
                {/* 创建一个div，className属性绑定到cn函数，isOver属性绑定到"isOver && "border-t-2 border-blue-500""，isDragging属性绑定到"isDragging && "opacity-50""，isSelected属性绑定到"isSelected && "bg-blue-100 dark:bg-blue-900/30""，onMouseEnter属性绑定到setIsHovered函数，onMouseLeave属性绑定到setIsHovered函数 */}
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
                    {/* 创建一个div，ref属性绑定到drag变量，className属性绑定到cn函数，cursor-move属性绑定到"cursor-move"，hover:bg-gray-100属性绑定到"hover:bg-gray-100"，rounded属性绑定到"rounded"，-translate-x-8属性绑定到"-translate-8"，opacity-0属性绑定到"opacity-0"，group-hover:opacity-100属性绑定到"group-hover:opacity-100"，transition-opacity属性绑定到"transition-opacity" */}
                    <GripVertical className="h-4 w-4 text-gray-400" />
                </div>
                <div
                    ref={divRef}
                    contentEditable
                    suppressContentEditableWarning
                    className={cn(
                        "min-h-[1.5em] p-1 rounded outline-none",
                        "focus:bg-gray-50 dark:focus:bg-gray-800",
                        "empty:before:pointer-events-none empty:before:h-0 empty:before:float-left",
                        getBlockStyle()
                    )}
                    data-placeholder={placeholder}
                    onInput={handleInput}
                    onFocus={() => onFocus(id)}
                    onBlur={() => onBlur(id)}
                    onKeyDown={handleKeyDownInternal}
                >
                    <StyledContent content={content} style={style} />
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

