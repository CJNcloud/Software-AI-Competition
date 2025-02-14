import React, {useEffect, useRef, useState, useCallback} from 'react'
import { Trash2, GripVertical } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useDragBlock } from '@/hooks/useDragBlock'
import { TextBlockProps } from './BlockInterface/Block' 
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
    
        const textNodes = getTextNodes(divRef.current);
        let remainingOffset = lastSelectionRef.current.offset;
    
        for (const node of textNodes) {
            if (remainingOffset <= node.length) {
                const range = document.createRange();
                range.setStart(node, remainingOffset);
                range.setEnd(node, remainingOffset);
                selection.removeAllRanges();
                selection.addRange(range);
                break;
            }
            remainingOffset -= node.length;
        }
    }, []);
    
    const getTextNodes = (element: HTMLElement): Text[] => {
        const textNodes: Text[] = [];
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
        let node;
        while ((node = walker.nextNode())) {
            textNodes.push(node as Text);
        }
        return textNodes;
    };
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
        const div = divRef.current;
        if (!div) return;
      
        // 添加 mutation observer 监听 DOM 变化
        const observer = new MutationObserver(() => {
          requestAnimationFrame(restoreSelection);
        });
      
        observer.observe(div, {
          subtree: true,
          childList: true,
          characterData: true
        });
      
        return () => observer.disconnect();
      }, [restoreSelection]);
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
        onChange(id, content);
    };
    // 添加一个处理键盘事件的函数
    const handleKeyDownInternal = (e: React.KeyboardEvent<HTMLDivElement>) => {
        // 如果内容为空且按下了退格键
        onKeyDown(e, id);
    };
    const getStyledContent = () => {
        if (!content) return { __html: '' }; // 空内容处理
      
        let currentPosition = 0;
        let html = '';
      
        style?.forEach((segment) => {
          const text = content.slice(currentPosition, segment.length);
          currentPosition += segment.length;
      
          const styles = [];
          if (segment.attributes?.bold) styles.push('font-bold');
          if (segment.attributes?.italic) styles.push('italic');
          
          html += styles.length > 0 
            ? `<span class="${styles.join(' ')}">${text}</span>` 
            : text;
        });
      
        return { __html: html }; // 始终返回包含 __html 的对象
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
                    dangerouslySetInnerHTML={getStyledContent()}
                    id={id}
                >
                    
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

