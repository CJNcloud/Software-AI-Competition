import React, { useState, useCallback, useEffect,useRef} from 'react'
import { TextBlock } from './blocks/TextBlock'
import { FloatingToolbar } from './toolbar'
import { SlashCommandMenu } from './SlashCommandMenu'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { v4 as uuidv4 } from 'uuid'
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { ImageBlock } from './blocks/ImageBlock'
import { AIPicture, AIsummary } from './AI'
import { handleaddBlock, BlockChange, handledeleteBlock, handletoggleBlockType, handlemoveBlock,BlockSelect} from '@/controller/BlockConroller'
interface BlockData {
    id: string;
    type: string;
    content: string;
}
interface BlocksStyle {
    id: string
    style:{ length: number, attributes: { [key: string]: string[] } }[]
}
interface EditorProps {
    pageId: string;
}

export function Editor({ pageId }: EditorProps) {
    const [blocks, setBlocks] = useState<BlockData[]>([]);
    const [blockstyle,setBlockstyle] = useState<BlocksStyle[]>([])
    const [ydoc, setYdoc] = useState(() => {
        return new Y.Doc();
      });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [showSlashMenu, setShowSlashMenu] = useState<boolean>(false);
    const [slashMenuBlockId, setSlashMenuBlockId] = useState<string | null>(null);
    const [slashMenuPosition, setSlashMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    // const [provider, setProvider] = useState<SimpleStompProvider | null>(null);
    const [awareness, setAwareness] = useState<any>(null);
    const userId = useRef(uuidv4()); // 为每个用户生成唯一ID
    const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set());
    const blocksRef = useRef(blocks);
    useEffect(() => {
        blocksRef.current = blocks;
    }, [blocks]);
    useEffect(() => {
        // const provider = new SimpleStompProvider(
        //     'ws://forfries.com:8887/ws',
        //     pageId,
        //     ydoc
        // );
        setIsLoading(true);
        const blocksArray = ydoc.getArray<string>('blocksArray');
        const blocksData: Y.Map<Y.Map<string>> = ydoc.getMap<Y.Map<string>>('blocksData');
        const blocksContent :Y.Map<Y.Text>= ydoc.getMap<Y.Text>('blocksContent');
        let initialized = false;
        // provider.on('sync', (isSynced: boolean) => {
        //     if (isSynced && !initialized) {
        //         initialized = true;
        //         console.log('同步完成,当前blocks数量:', blocksArray.length);
        //         blocksContent.observe(() =>{
        //             const style: BlocksStyle[] = [];
        //             blocksContent.forEach((blockcontent,blockid) => {
        //                 // console.log('change',blockid, 'blockcontent',blockcontent.toDelta());
        //                 const ts = blockcontent.toDelta()!.map((item: { insert: string, attributes?: { style?: string[] } }) => {
        //                     const attributes = item.attributes || {};
        //                     return {
        //                       length: item.insert.length,
        //                       attributes: attributes
        //                     };
        //                   });
        //                 // console.log('ts',ts);
        //                 const tempstyle : { id: string, style: { length: number, attributes: { [key: string]: string[] } }[] }= { id: blockid, style: ts }
        //                 console.log('tempstyle', tempstyle);
        //                 style.push(tempstyle);
        //             });
        //             setBlockstyle(style);
        //         })
        //         // 设置观察者来监听变化
        //         blocksArray.observe(() => {
        //             // console.log('blocksArray changed:');
        //             const newBlocks: BlockData[] = [];
        //             blocksArray.forEach((blockId) => {
        //                 const blockData = blocksData.get(blockId);
        //                 // console.log(blockData!.get('content')!);
        //                 if (blockData) {
        //                     newBlocks.push({
        //                         id: blockData.get('id')!,
        //                         type: blockData.get('type')!,
        //                         content: blockData.get('content')!,
        //                     });
        //                 }
        //             });
        //             // console.log(newBlocks);
        //             setBlocks(newBlocks);
        //         });
        //         setIsLoading(false);
        //     }
        initialized = true;
            console.log('同步完成,当前blocks数量:', blocksArray.length);
            blocksContent.observe(() =>{
                const style: BlocksStyle[] = [];
                blocksContent.forEach((blockcontent,blockid) => {
                    // console.log('change',blockid, 'blockcontent',blockcontent.toDelta());
                    const ts = blockcontent.toDelta()!.map((item: { insert: string, attributes?: { style?: string[] } }) => {
                        const attributes = item.attributes || {};
                        return {
                          length: item.insert.length,
                          attributes: attributes
                        };
                      });
                    // console.log('ts',ts);
                    const tempstyle : { id: string, style: { length: number, attributes: { [key: string]: string[] } }[] }= { id: blockid, style: ts }
                    console.log('tempstyle', tempstyle);
                    style.push(tempstyle);
                });
                setBlockstyle(style);
            })
            // 设置观察者来监听变化
            blocksArray.observe(() => {
                // console.log('blocksArray changed:');
                const newBlocks: BlockData[] = [];
                blocksArray.forEach((blockId) => {
                    const blockData = blocksData.get(blockId);
                    // console.log(blockData!.get('content')!);
                    if (blockData) {
                        newBlocks.push({
                            id: blockData.get('id')!,
                            type: blockData.get('type')!,
                            content: blockData.get('content')!,
                        });
                    }
                });
                // console.log(newBlocks);
                setBlocks(newBlocks);
            });
            setIsLoading(false);
        return () => {
            // provider.destroy();
            ydoc.destroy();
        };
    }, [pageId]);
    const handleBlockChange = useCallback((id: string, content: string='') => { 
        // 将所有操作包装在一个事务中
        console.log(id,'+',content)
        BlockChange(id, content, ydoc);
    }, []);
    const handleBlockFocus = useCallback((id: string) => {
        setSelectedBlockId(id);
        // 如果当前聚焦的块不是打开斜杠菜单的块，则关闭斜杠菜单
        if (id !== slashMenuBlockId) {
            setShowSlashMenu(false);
            setSlashMenuBlockId(null);
        }
    }, [slashMenuBlockId]);
    const handleBlockBlur = useCallback((id: string|null) => {
        if(id == null) {
            setSelectedBlockId(null);
        }
        // 添加一个延时，因为我们需要确保新的焦点已经设置
        setTimeout(() => {
            // 检查新的焦点是否在斜杠菜单内
            const activeElement = document.activeElement;
            const slashMenuElement = document.querySelector('[role="menu"]');
            if (slashMenuElement && !slashMenuElement.contains(activeElement)) {
                setShowSlashMenu(false);
                setSlashMenuBlockId(null);
            }
        }, 0);
    }, []);
    const handleKeyDown = useCallback((e: React.KeyboardEvent, blockId: string) => {
        if (e.key === '/') {
            // 获取当前块的内容
            const blocksArray = ydoc.getArray<string>('blocksArray');
            const blocksData = ydoc.getMap<Y.Map<string>>('blocksData');
            let currentBlockContent = '';
            
            blocksArray.forEach((blockMap) => {
                if (blocksData.get(blockMap)?.get('id') === blockId) {
                    currentBlockContent = blocksData.get(blockMap)?.get('content') || '';
                }
            });

            // 只有当块为空时才显示斜杠菜单
            if (!currentBlockContent.trim()) {
                const rect = (e.target as HTMLElement).getBoundingClientRect();
                setSlashMenuPosition({ x: rect.left, y: rect.bottom });
                setShowSlashMenu(true);
                setSlashMenuBlockId(blockId);
            }
        } else if (e.key === 'Escape') {
            setShowSlashMenu(false);
            setSlashMenuBlockId(null);
        } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const blocksArray = ydoc.getArray<string>('blocksArray');
            const blocksData:Y.Map<Y.Map<string>>=ydoc.getMap<Y.Map<string>>('blocksData');
            const newBlockMap=new Y.Map<string>();
            const id:string=uuidv4();
            newBlockMap.set('id',id) ;
            newBlockMap.set('content', '');
            newBlockMap.set('type', 'paragraph');
            
            let targetIndex = -1;
            blocksArray.forEach((blockMap, index) => {
                if (blockMap === blockId) {
                    targetIndex = index;
                }
            });

            if (targetIndex !== -1) {
                blocksData.set(id, newBlockMap);
                blocksArray.insert(targetIndex + 1, [id]);
                // 在创建新块后立即设置焦点
                setTimeout(() => {
                    setSelectedBlockId(id);
                }, 0);
            } else {
                console.log("Block with id " + blockId + " not found.");
            }
        } else if (e.key === 'Backspace' && (e.target as HTMLElement).textContent === '') {
            e.preventDefault();
            deleteBlock(blockId);
        }
    }, []);
    const handleSlashCommand = useCallback((type: string) => {
    if (slashMenuBlockId) {
        const blocksArray = ydoc.getArray<string>('blocksArray');
        const blocksData:Y.Map<Y.Map<string>>=ydoc.getMap<Y.Map<string>>('blocksData');
        
        // 将所有操作包装在一个事务中
        ydoc.transact(() => {
            blocksArray.forEach((blockMap,index) => {
                if (blockMap === slashMenuBlockId) {
                    // 1. 清除内容
                    blocksData.get(blockMap)!.set('content', '');
                    // 2. 设置新类型
                    blocksData.get(blockMap)!.set('type', type);
                    // 3. 删除并重新插入以触发更新
                    blocksArray.delete(index,1);
                    blocksArray.insert(index,[blockMap]);
                }
            });
        });
        // 设置焦点（这个操作不需要包含在事务中，因为它只影响本地UI）
        setTimeout(() => {
            setSelectedBlockId(slashMenuBlockId);
        }, 0);
    } else {
        addBlock(type);
    }
    setShowSlashMenu(false);
    setSlashMenuBlockId(null);
    }, [slashMenuBlockId]);
    const addBlock = useCallback((type: string,content: string='',id : string  =uuidv4() ) => {
        setYdoc(handleaddBlock(type, content, id, ydoc) );
    }, [ydoc]); 
    const moveBlock = useCallback((dragIndex: number, hoverIndex: number) => {
        setYdoc(handlemoveBlock(dragIndex, hoverIndex, ydoc, selectedBlocks));
    }, [selectedBlocks]);
    const deleteBlock = useCallback((id: string) => {
        setYdoc(handledeleteBlock(id, ydoc));
    }, [ydoc]);
    const toggleBlockType = useCallback((id: string, newType: string) => {
        setYdoc(handletoggleBlockType(id, newType,ydoc));
    }, [ydoc]);
    // 处理单击选择
    const handleBlockSelect = useCallback((blockId: string, e: MouseEvent) => {
        setSelectedBlocks((selectedBlocks)=>BlockSelect(blockId, e, selectedBlocks));
    }, [ydoc]);
    const handleAISummary = useCallback(async (type: string) => {
        // 首先添加一个加载提示的 block
        const loadingBlockId = uuidv4();
        addBlock(type, "正在生成中，请稍后...",loadingBlockId);
        
        try {
            const response = await AIsummary(blocks);
            // 获取到响应后，删除加载提示并添加新内容
            deleteBlock(loadingBlockId);
            addBlock(type, response);
        } catch (error) {
            // 如果出错，更新加载提示为错误信息
            deleteBlock(loadingBlockId);
            addBlock(type, "生成失败，请重试");
            console.error('AI Summary failed:', error);
        }
    }, [blocks, addBlock, deleteBlock]);
    const handleAIPicture = useCallback(async (type: string) => {
        // 首先添加一个加载提示的 block
        const loadingBlockId = uuidv4();
        addBlock('paragraph', "正在生成中，请稍后...",loadingBlockId);
        try {
            const response = await AIPicture(blocks);
            // 获取到响应后，删除加载提示并添加新内容
            console.log(response);
            deleteBlock(loadingBlockId);
            addBlock(type, response);
        } catch (error) {
            // 如果出错，更新加载提示为错误信息
            deleteBlock(loadingBlockId);
            addBlock(type, "生成失败，请重试");
            console.error('AI Summary failed:', error);
        }
    }, [blocks, addBlock, deleteBlock]);
    const getBlockStyle = useCallback((blockid: string) => {
    const blockStyle = blockstyle.find((style) => style.id === blockid);
    return blockStyle?.style || [];
    }, [blockstyle]);
    return (
        <DndProvider backend={HTML5Backend} options={{ enableMouseEvents: true }}>
            <div className="w-full max-w-4xl mx-auto p-4 bg-white min-h-screen relative">
                {isLoading ? (
                    <div className="flex items-center justify-center h-[200px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-3 text-muted-foreground">正在连接到页面...</span>
                    </div>
                ) : (
                    <>
                        <div className="relative">
                            {blocks.map((block, index) => (
                                block.type === 'image' ? (
                                    <ImageBlock
                                        key = {block.id}
                                        {...block}
                                        onChange = {handleBlockChange}
                                        onFocus = {handleBlockFocus}
                                        onBlur = {handleBlockBlur}
                                        onDelete = {deleteBlock}  
                                        index = {index}
                                        moveBlock={moveBlock}
                                        isSelected = {selectedBlocks.has(block.id)}
                                        onSelect = {handleBlockSelect}
                                        userId = {userId.current}
                                    />
                                ) : (
                                    <TextBlock
                                        key = {block.id}
                                        {...block}
                                        onChange = {handleBlockChange}
                                        onFocus = {handleBlockFocus}
                                        onBlur = {handleBlockBlur}
                                        onKeyDown = {handleKeyDown}
                                        onDelete = {deleteBlock}
                                        index = {index}
                                        moveBlock = {moveBlock}
                                        awareness = {awareness}
                                        userId = {userId.current}
                                        isSelected = {selectedBlocks.has(block.id)}
                                        onSelect = {handleBlockSelect}
                                        placeholder = {index === 0 ? "输入标题..." : "按下 / 开始创作"}
                                        style = {getBlockStyle(block.id)!}
                                    />
                                )
                            ))}
                        </div>
                        
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-4 text-gray-500 hover:text-gray-700"
                            onClick={() => addBlock('paragraph')}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add a block
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-4 text-gray-500 hover:text-gray-700"
                            onClick={() => handleAISummary('paragraph')}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            AI Summary
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-4 text-gray-500 hover:text-gray-700"
                            onClick={() => handleAIPicture('image')}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            AI Picture
                        </Button>
                        {selectedBlockId && (
                            <FloatingToolbar
                                blockId={selectedBlockId}
                                onToggleType={(type) => toggleBlockType(selectedBlockId, type)}
                                ydoc={ydoc}
                            />
                        )}
                        {showSlashMenu && (
                            <SlashCommandMenu
                                position={slashMenuPosition}
                                onSelect={handleSlashCommand}
                                onClose={() => {
                                    setShowSlashMenu(false);
                                    setSlashMenuBlockId(null);
                                }}
                            />
                        )}
                    </>
                )}
            </div>
        </DndProvider>
    );
}
