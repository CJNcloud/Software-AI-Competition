import React, { useRef, useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Trash2, GripVertical, Image as ImageIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Upload } from "antd";
import type { UploadProps } from 'antd';
import { message } from 'antd';
import { useDragBlock } from '@/hooks/useDragBlock';
import { ImageBlockProps } from './BlockInterface/Block';
export const ImageBlock: React.FC<ImageBlockProps> = ({
    id,
    content,
    onChange,
    onDelete,
    index,
    moveBlock,
    isSelected,
    onSelect,
    awareness,
    userId,
}) => {
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
                
                const response = await fetch('http://forfries.com:8885/file/upload', {
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
    const {setIsHovered , ref, drag, isDragging, isOver}= useDragBlock(id, index, moveBlock)
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