import { useEffect, useState, useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd';
interface DragItem {
    id: string
    type: string
    index:number
}
export const useDragBlock = (id: string, index: number, moveBlock: (dragIndex: number, hoverIndex: number) => void) => {
    const [isHovered, setIsHovered] = useState(false)
    const ref = useRef<HTMLDivElement>(null);
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
    const [{ isOver }, drop] = useDrop({
            accept: 'BLOCK',
            collect: (monitor) => ({
                isOver: monitor.isOver(),
            }),
            hover: (item: any) => {
                if (!ref.current) return;
                const dragIndex = item.index;
                const hoverIndex = index;
                if (dragIndex === hoverIndex) return;
                moveBlock(dragIndex, hoverIndex);
                item.index = hoverIndex;
            },
            drop: (item) => {
                const dragIndex = item.index
                const hoverIndex = index
                // Only perform the move when the drag has ended (mouse is dropped)
                if (dragIndex !== hoverIndex) {
                    moveBlock(dragIndex, hoverIndex)
                }
            },
        });         
    useEffect(() => {
        dragPreview(drop(ref))
    }, [dragPreview, drop])
    return {
        setIsHovered , ref, drag, isDragging, isOver
    }
}
    