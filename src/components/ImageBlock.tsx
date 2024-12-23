import React, { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Trash2, GripVertical, Image as ImageIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import * as Y from 'yjs';
import { Upload } from "antd";
import type { UploadProps } from 'antd';
import { message } from 'antd';

interface ImageBlockProps {
    id: string;
    type: string;
    content: string; // URL of the image
    onChange: (id: string, content: string) => void;
    onFocus: (id: string) => void;
    onBlur: (id: string|null) => void;
    onDelete: (id: string) => void;
    index: number;
    moveBlock: (dragIndex: number, hoverIndex: number) => void;
    isSelected: boolean;
    onSelect: (id: string, e: MouseEvent) => void;
    ydoc: Y.Doc;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({
    id,
    content,
    onChange,
    onFocus,
    onBlur,
    onDelete,
    index,
    moveBlock,
    isSelected,
    onSelect,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.target as HTMLImageElement;
        const maxWidth = 800; // 最大宽度
        const maxHeight = 600; // 最大高度
        
        let newWidth = img.naturalWidth;
        let newHeight = img.naturalHeight;

        // 如果图片原始尺寸超过最大限制，按比例缩放
        if (newWidth > maxWidth) {
            const ratio = maxWidth / newWidth;
            newWidth = maxWidth;
            newHeight = newHeight * ratio;
        }

        if (newHeight > maxHeight) {
            const ratio = maxHeight / newHeight;
            newHeight = maxHeight;
            newWidth = newWidth * ratio;
        }

        setImageSize({ width: newWidth, height: newHeight });
    };

    const uploadProps: UploadProps = {
        name: 'file',
        multiple: false,
        showUploadList: false,
        accept: 'image/*',
        customRequest: async (options) => {
            const { file, onSuccess, onError } = options;
            
            try {
                const formData = new FormData();
                formData.append('file', file);
                
                const response = await fetch('https://apifoxmock.com/m1/5580270-5258205-default/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                const data = await response.json();
                const contentURL = data.data; // 假设后端返回 { data: "图片URL" }
                console.log(contentURL);
                console.log('content='+content);
                onChange(id,contentURL);
                console.log('content='+content);
                message.success('Upload successful');
            } catch (error) {
                console.error('Upload error:', error);
                onError?.(error as Error);
                message.error('Upload failed');
            }
        },
    };

    const [{ isDragging }, drag, dragPreview] = useDrag({
        type: 'BLOCK',
        item: { id, type: 'BLOCK', index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [{ isOver }, drop] = useDrop({
        accept: 'BLOCK',
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
        hover: (item: any, monitor) => {
            if (!ref.current) return;
            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) return;
            moveBlock(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    React.useEffect(() => {
        dragPreview(drop(ref));
    }, [dragPreview, drop]);

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
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-8 cursor-move w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 rounded"
                >
                    <GripVertical className="h-4 w-4 text-gray-400" />
                </div>

                <div className="min-h-[100px] p-2 rounded">
                    {content ? (
                        <Upload {...uploadProps}>
                            <div className="flex justify-center">
                                <img 
                                    src={content} 
                                    alt="Uploaded content"
                                    className={cn(
                                        "rounded cursor-pointer hover:opacity-90 transition-opacity",
                                        "max-w-full object-contain"
                                    )}
                                    style={{
                                        width: imageSize.width || 'auto',
                                        height: imageSize.height || 'auto',
                                        minWidth: '200px', // 最小宽度
                                        minHeight: '100px', // 最小高度
                                    }}
                                    onLoad={handleImageLoad}
                                    onError={(e) => {
                                        console.error('Image loading error:', e);
                                        // 可以设置一个默认的错误占位图
                                        // e.currentTarget.src = '/error-placeholder.png';
                                    }}
                                />
                            </div>
                        </Upload>
                    ) : (
                        <Upload {...uploadProps}>
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-gray-400 transition-colors">
                                <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500">
                                    Click to upload image
                                </span>
                            </div>
                        </Upload>
                    )}
                </div>

                <button
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity"
                    onClick={() => onDelete(id)}
                >
                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
            </div>
        </div>
    );
};