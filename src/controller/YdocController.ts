import { v4 as uuidv4 } from 'uuid'
import * as Y from 'yjs';
import * as Diff from 'diff';
const getblocksArray = (ydoc: Y.Doc) => {
    const blocksArray = ydoc.getArray<string>('blocksArray');
    return blocksArray;
}
const getblocksData = (ydoc: Y.Doc) => {
    const blocksData:Y.Map<Y.Map<string>> = ydoc.getMap<Y.Map<string>>('blocksData');
    return blocksData;
}
const getblocksContent = (ydoc: Y.Doc) => {
    const blocksContent = ydoc.getMap<Y.Text>('blocksContent');
    return blocksContent;
}
export const YhandleAddBlock = (type: string,content: string='',id : string  =uuidv4(),ydoc: Y.Doc) => {
    // 获取ydoc中的blocksArray和blocksDatac
    const blocksContent = getblocksContent(ydoc);
    const blocksArray = getblocksArray(ydoc);
    const blocksData = getblocksData(ydoc);
    // 创建一个新的块，并设置其id、content和type
    const newBlockMap:Y.Map<string> = new Y.Map<string>();
    newBlockMap.set('id', id);
    newBlockMap.set('content', content);
    newBlockMap.set('type', type);
    // 将新的块添加到blocksData中
    blocksData.set(id, newBlockMap);
    // 将新的块的id添加到blocksArray中
    blocksArray.push([id]);
    // console.log('blocksArrayafter:',blocksArray.length);
    blocksContent.set(id, new Y.Text());
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
            // console.log('nowcontent',content)
            const blocksContent = getblocksContent(ydoc);
            // 获取blocksArray数组
            const blocksArray = getblocksArray(ydoc);
            // 获取blocksData映射
            const blocksData = getblocksData(ydoc);
            const oldContent = blocksData.get(id)!.get('content')!;
            const newContent = content;
            const diffContent = Diff.diffChars(oldContent, newContent);
            let label=-1;
            diffContent.forEach((part) => {
                label+=part.count!;
                if (part.added) {
                    // console.log('part.added:',part.added);
                    blocksContent.get(id)!.insert(label,part.value);
                }
                else if (part.removed) {
                    // console.log('part.removed:',part.removed);
                    blocksContent.get(id)!.delete(label,part.count!);
                    label-=part.count!;
                }
            })
            const tempid= uuidv4();
            blocksContent.set(tempid,new Y.Text(''));
            blocksContent.delete(tempid);
            //让blocksContent观察者起作用一下
            // console.log('blocksContent:',blocksContent.get(id)!.toDelta());
            // 遍历blocksArray数组
            blocksArray.forEach((blockMap,index) => {
                // 如果blocksData映射中id与传入的id相等
                if (blocksData.get(blockMap)!.get('id') === id) {
                    // console.log('Blockdata',blocksData.get(blockMap)!.get('content'));
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
export const YhandletoggleStyle = (
    blockId: string,
    style: string,
    ydoc: Y.Doc = new Y.Doc()
  ) => {
    ydoc.transact(() => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
  
      const range = selection.getRangeAt(0);
      const blockElement = document.getElementById(blockId);
      if (!blockElement) 
        {
            console.log('blockElement:');
            return;
        }
  
      // 计算绝对偏移量
      const startOffset = calculateOffset(blockElement, range.startContainer, range.startOffset);
      const endOffset = calculateOffset(blockElement, range.endContainer, range.endOffset);
      console.log('startOffset:',startOffset,'endOffset:',endOffset);
      if (startOffset === -1 || endOffset === -1) return;
  
      const blocksContent = ydoc.getMap<Y.Text>('blocksContent');
      const text = blocksContent.get(blockId);
      if (!text) return;
  
      // 判断是否需要移除样式
      const shouldRemove = checkStyleExistence(text, startOffset, endOffset, style);
      console.log('shouldRemove:',shouldRemove);
      // 执行样式切换
      text.format(startOffset, endOffset - startOffset, {
        [style]: shouldRemove ? null : true
      });
      const tempid= uuidv4();
       blocksContent.set(tempid,new Y.Text(''));
      blocksContent.delete(tempid);
    });
    return ydoc;
  };
  
  // 计算基于 DOM 的绝对偏移量
  const calculateOffset = (
    container: HTMLElement,
    targetNode: Node,
    targetOffset: number
  ): number => {
    let offset = 0;
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node === targetNode) {
        return offset + targetOffset;
      }
      offset += node.textContent!.length;
    }
    return -1;
  };
  
  // 检查指定范围内是否全部存在目标样式
  const checkStyleExistence = (
    text: Y.Text,
    start: number,
    end: number,
    style: string
  ): boolean => {
    let currentPos = 0;
    const delta = text.toDelta();
  
    for (const op of delta) {
      const opLength = op.insert.length;
      const opEnd = currentPos + opLength;
  
      // 跳过未重叠的操作
      if (opEnd <= start) {
        currentPos = opEnd;
        continue;
      }
  
      // 提前终止遍历
      if (currentPos >= end) break;
  
      // 计算重叠区域
      const overlapStart = Math.max(start, currentPos);
      const overlapEnd = Math.min(end, opEnd);
      
      // 检测样式状态
      if (op.attributes?.[style] !== true) {
        return false;
      }
  
      currentPos = opEnd;
    }
    return true;
  };