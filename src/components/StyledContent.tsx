import React from 'react';
import { cn } from "@/lib/utils";

interface StyleSegment {
    length: number;
    attributes: {
        [key: string]: any;
    };
}

interface StyledContentProps {
    content: string;
    style?: StyleSegment[];
}

export const StyledContent: React.FC<StyledContentProps> = ({ content, style }) => {
    if (!style || !content) return content;

    let currentPosition = 0;
    return (
        <>
            {style.map((segment, index) => {
                const text = content.substr(currentPosition, segment.length);
                currentPosition += segment.length;
                
                // 检查是否有样式属性
                const hasAttributes = segment.attributes && 
                                    Object.keys(segment.attributes).length > 0;

                // 如果没有样式属性，直接返回文本
                if (!hasAttributes) {
                    return text;
                }

                // 如果有样式属性，用span包裹并添加相应的样式
                return (
                    <span 
                        key={index}
                        className={cn({
                            'font-bold': segment.attributes.bold,
                            'italic': segment.attributes.italic,
                            'underline': segment.attributes.underline,
                            'line-through': segment.attributes.strike,
                            // 添加其他样式映射
                        })}
                    >
                        {text}
                    </span>
                );
            })}
        </>
    );
}; 