// DndProvider 的本质是一个由 React.createContext 创建一个上下文的容器(组件)，用于控制拖拽的行为，数据的共享，类似于react-redux的Provider。
// Backend
// 上面我们给DndProvider传的参数是一个backend，那么这里来解释一下什么是backend
// React DnD 将 DOM 事件相关的代码独立出来，将拖拽事件转换为 React DnD 内部的 redux action。由于拖拽发生在 H5 的时候是 ondrag，发生在移动设备的时候是由 touch 模拟，React DnD 将这部分单独抽出来，方便后续的扩展，这部分就叫做 Backend。它是 DnD 在 Dom 层的实现。

// react-dnd-html5-backend : 用于控制html5事件的backend
// react-dnd-touch-backend : 用于控制移动端touch事件的backend
// react-dnd-test-backend : 用户可以参考自定义backend
// useDrag返回三个参数
// 第一个返回值是一个对象 表示关联在拖拽过程中的变量，需要在传入useDrag的规范方法的collect属性中进行映射绑定,比如：isDraging,canDrag等
// 第二个返回值 代表拖拽元素的ref
// 第三个返回值 代表拖拽元素拖拽后实际操作到的dom
// type: 指定元素的类型，只有类型相同的元素才能进行drop操作
// item: 元素在拖拽过程中，描述该对象的数据，如果指定的是一个方法，则方法会在开始拖拽时调用，并且需要返回一个对象来描述该元素。
// end(item, monitor): 拖拽结束的回调函数，item表示拖拽物的描述数据，monitor表示一个 DragTargetMonitor 实例
// isDragging(monitor)：判断元素是否在拖拽过程中，可以覆盖Monitor对象中的isDragging方法，monitor表示一个 DragTargetMonitor 实例
// https://juejin.cn/post/7155046917028708359
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
        type: 'Block',
        item: (): DragItem => ({
            id,
            type: 'Block',
            index,
        }),
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    })
    const [{ isOver }, drop] = useDrop({
            accept: 'Block',
            collect: (monitor) => ({
                isOver: monitor.isOver(),
            }),
            // hover: (item: any) => {
            //     if (!ref.current) return;
            //     const dragIndex = item.index;
            //     const hoverIndex = index;
            //     if (dragIndex === hoverIndex) return;
            //     moveBlock(dragIndex, hoverIndex);
            //     item.index = hoverIndex;
            // },
            drop: (item: any) => {
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
    