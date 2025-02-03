import React, {useEffect, useState, useCallback} from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { Trash2, GripVertical } from 'lucide-react'
import { cn } from "@/lib/utils"
import { v4 as uuidv4 } from 'uuid'
import * as Y from 'yjs';
const getblocksArray = (ydoc: Y.Doc) => {
    const blocksArray = ydoc.getArray<string>('blocksArray');
    return blocksArray;
}
const getblocksData = (ydoc: Y.Doc) => {
    const blocksData:Y.Map<Y.Map<string>> = ydoc.getMap<Y.Map<string>>('blocksData');
    return blocksData;
}
export const YhandleAddBlock = (type: string,content: string='',id : string  =uuidv4(),ydoc: Y.Doc) => {
    // 获取ydoc中的blocksArray和blocksDatac
    const blocksArray = getblocksArray(ydoc);
    const blocksData = getblocksData(ydoc);
    console.log('blocksArrayprev:',blocksArray.length);
    const blocksArray1 = getblocksArray(ydoc);
    console.log('blocksArray1prev:',blocksArray1.length);
        // 创建一个新的块，并设置其id、content和type
        console.log(blocksData.has(id));
        const newBlockMap:Y.Map<string> = new Y.Map<string>();
        newBlockMap.set('id', id);
        newBlockMap.set('content', content);
        newBlockMap.set('type', type);
        // 将新的块添加到blocksData中
        blocksData.set(id, newBlockMap);
        // 将新的块的id添加到blocksArray中
        blocksArray.push([id]);
        // console.log('blocksArrayafter:',blocksArray.length);
        return ydoc;
}
export const YhandlemoveBlock = (dragIndex: number, 
                                hoverIndex: number,
                                ydoc: Y.Doc = new Y.Doc(),
                                selectedBlocks: Set<string> = new Set()
                                ) => 
                                {
        const blocksArray = getblocksArray(ydoc);
        // 如果拖动的块在选中集合中
        if (selectedBlocks.has(blocksArray.get(dragIndex))) {
            // 获取所有选中块的索引
            const selectedIndices = Array.from(blocksArray)
                .map((blockId, index) => selectedBlocks.has(blockId) ? index : -1)
                .filter(index => index !== -1)
                .sort((a, b) => a - b);
            ydoc.transact(() => {
                // 计算目标位置的偏移量
                // const offset = hoverIndex - dragIndex;
                const targetIndex = Math.min(Math.max(0, hoverIndex), blocksArray.length - selectedIndices.length);
                // 先删除所有选中的块，并保存它们的ID
                const selectedBlockIds = selectedIndices.map(index => blocksArray.get(index));
                // 从后往前删除，这样不会影响前面的索引
                for (let i = selectedIndices.length - 1; i >= 0; i--) {
                    blocksArray.delete(selectedIndices[i], 1);
                }
                // 在目标位置插入所有选中的块
                blocksArray.insert(targetIndex, selectedBlockIds);
            });
        } else {
            // 如果拖动的块不在选中集合中，保持原有的单块移动逻辑
            const DragBlockID = blocksArray.get(dragIndex);
            const HoverBlockID = blocksArray.get(hoverIndex);
            ydoc.transact(() => {
                hoverIndex === blocksArray.length 
                    ? blocksArray.push([DragBlockID.toString()]) 
                    : blocksArray.insert(hoverIndex + 1, [DragBlockID.toString()]);
                blocksArray.delete(hoverIndex, 1);
                dragIndex === blocksArray.length 
                    ? blocksArray.unshift([HoverBlockID.toString()]) 
                    : blocksArray.insert(dragIndex + 1, [HoverBlockID.toString()]);
                blocksArray.delete(dragIndex, 1);
            });
        }
        return ydoc;
}
export const YhandleBlockChange = (id: string, content: string,ydoc:Y.Doc) => { 
        // 将所有操作包装在一个事务中
        ydoc.transact(() => {
            // 获取blocksArray数组
            const blocksArray = getblocksArray(ydoc);
            // 获取blocksData映射
            const blocksData = getblocksData(ydoc);
            // 遍历blocksArray数组
            blocksArray.forEach((blockMap,index) => {
                // 如果blocksData映射中id与传入的id相等
                if (blocksData.get(blockMap)!.get('id') === id) {
                    blocksData.get(blockMap)!.set('content', content);
                    // 2. 删除并重新插入以触发更新
                    blocksArray.delete(index,1);
                    blocksArray.insert(index,[blockMap]);
                }
            });
        });
        return ydoc;
}
export const YhandledeleteBlock = (id: string , ydoc: Y.Doc ) => {
        console.log('blocksArraybefore:');
        const blocksArray = getblocksArray(ydoc);
        const blocksData = getblocksData(ydoc);
        blocksArray.forEach((blockMap, indexArray) => {
        if (blockMap === id) {
            ydoc.transact(()=>{
                blocksData.delete(blockMap);
                blocksArray.delete(indexArray, 1);
            })
        }
    });
    return ydoc;
}
export const YhandletoggleBlockType = (id: string, newType: string, ydoc:Y.Doc= new Y.Doc()) => {
        const blocksArray = getblocksArray(ydoc);
        const blocksData:Y.Map<Y.Map<string>>= getblocksData(ydoc);
        ydoc.transact(() => {
            blocksArray.forEach((blockMap,index) => {
                if (blockMap === id) {
                    // 1. 更新类型
                    blocksData.get(blockMap)!.set('type',newType);
                    // 2. 删除并重新插入以触发更新
                    blocksArray.delete(index,1);
                    blocksArray.insert(index,[blockMap]);
                }
            });
        });
        return ydoc;
}