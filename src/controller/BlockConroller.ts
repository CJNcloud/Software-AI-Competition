import { v4 as uuidv4 } from 'uuid'
import * as Y from 'yjs';
import { YhandleAddBlock, YhandlemoveBlock, YhandleBlockChange ,YhandledeleteBlock, YhandletoggleBlockType} from './YdocController'
export const handleaddBlock = ( type: string,content: string='',
                                id : string  =uuidv4(),
                                ydoc: Y.Doc ) => 
                                {
    
    return YhandleAddBlock(type,content,id,ydoc);
};
export const handlemoveBlock = (dragIndex: number, 
                                hoverIndex: number,
                                ydoc: Y.Doc = new Y.Doc(),
                                selectedBlocks: Set<string> = new Set()
                                ) => 
                                {
    return YhandlemoveBlock(dragIndex,hoverIndex,ydoc,selectedBlocks);
}
export const handledeleteBlock = (id: string , ydoc: Y.Doc ) => {
    return YhandledeleteBlock(id,ydoc);
}
export const BlockChange = (id: string, content: string, ydoc: Y.Doc= new Y.Doc()) => { 
    return YhandleBlockChange(id,content,ydoc);
}
export const handletoggleBlockType = (id: string, newType: string, ydoc:Y.Doc= new Y.Doc()) => {
    return YhandletoggleBlockType(id,newType,ydoc);
    }
export const BlockSelect = (blockId: string, e: MouseEvent , prevSelectedBlocks: Set<string> = new Set<string>()) => {
        if (e.ctrlKey || e.metaKey) {
            // Ctrl/Cmd + 点击实现多选
            const newSelection = new Set(prevSelectedBlocks);
            if (newSelection.has(blockId)) {
                newSelection.delete(blockId);
            } else {
                newSelection.add(blockId);
            }
            return newSelection;
        } else {
            // 普通点击只选择当前块
            return new Set([blockId]);
        }
    }