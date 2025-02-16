import React, { useEffect, useRef, useCallback } from 'react';
import { Trash2, GripVertical } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useDragBlock } from '@/hooks/useDragBlock';
import { TextBlockProps } from './BlockInterface/Block';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // 引入 Quill 样式
import { FloatingToolbar } from '../toolbar';
export const TextBlock: React.FC<TextBlockProps> = ({
    id,
    type,
    content,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    onDelete,
    index,
    moveBlock,
    awareness,
    userId,
    placeholder = "按下 / 开始创作",
    isSelected,
    onSelect,
}) => {
    const { setIsHovered, ref, drag, isDragging, isOver } = useDragBlock(id, index, moveBlock);
    const quillRef = useRef<ReactQuill>(null);
    const formats = useCallback(() => {
        switch (type) {
            case 'text':
                return [];
            case 'heading-1':
                return ['header'];
            default:
                return [];
        }
    }, [type]);

    const handleChange = (content: string) => {
        console.log('nowcontent',content);
        if(content!=='<p><br></p>')
        {
            onChange(id,content.replace(/<p><br><\/p>/g, ''));
        }
        else
        {
            onChange(id,'<p><br></p>');
        }  
    };
    const handleOnFocus = () => {
        onFocus(id);
    }
    const handleKeyDown = (event: React.KeyboardEvent) => {
        // 处理按键事件
        // console.log('content',content);
        if (event.key === 'Enter') {
            // 添加新块的逻辑
            event.preventDefault();
            onKeyDown(event, id);
            // 这里可以调用添加块的函数
        } else if (event.key === 'Backspace' && content==='<p><br></p>') {
            // 删除当前块的逻辑
            event.preventDefault();
            onChange(id,'');
        }else if (event.key === 'Backspace' && content==='') {
            onKeyDown(event, id);
        }
        else if (event.key === '/') {
            // 处理输入 '/' 的逻辑
            // 这里可以打开一个命令菜单或其他功能
            event.preventDefault();
            onKeyDown(event, id);
        }
        // 调用外部的 onKeyDown 处理
    };
    const handleApplyStyle = (blockid:string,style: string) => {
        const quill = quillRef.current;
        if (quill) {
            const editor = quill.getEditor();
            console.log(editor)
            const range = editor.getSelection();
            if (range) {
                console.log(range.index,range.length)
                console.log({ [style] : true })
                editor.formatText(range.index, range.length, { [style] : true });
            }
        }
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
                    isSelected && "bg-blue-100 dark:bg-blue-900/30"
                )}
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

                <ReactQuill
                    ref={quillRef}
                    value={content}
                    onChange={handleChange}
                    // 更改后使用编辑器的新内容回调。它将传递编辑器的 HTML 内容、表示更改的 delta 对象、更改
                    placeholder={placeholder}
                    className="text-gray-800 dark:text-gray-200 text-base leading-6 placeholder-gray-800 dark:placeholder-white"
                    modules={{
                        toolbar: null, // 禁用工具栏
                        keyboard: {
                          bindings: {
                            tab: false // 可选：禁用 tab 键
                          }
                        }}
                      }
                    onKeyDown={handleKeyDown}
                    theme="bubble" // 使用无工具栏的主题
                    onFocus={handleOnFocus}
                />
                {isSelected &&(
                <FloatingToolbar
                    blockId={id}
                    onApplyStyle={handleApplyStyle}
                />
            )}
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
    );
};