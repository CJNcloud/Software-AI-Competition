import React, { useState, useCallback, useEffect,useRef} from 'react'
import { Block } from './block'
import { FloatingToolbar } from './toolbar'
import { SlashCommandMenu } from './SlashCommandMenu'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { v4 as uuidv4 } from 'uuid'
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'
import * as Y from 'yjs';
import { SimpleStompProvider } from '@/lib/simple-stomp-provider'
import Selecto from "react-selecto";
import { ImageBlock } from './ImageBlock'

interface BlockData {
    id: string;
    type: string;
    content: string;
}
//savedBlocks ? JSON.parse(savedBlocks) :
// interface CursorState {
//   blockId: string;
//   offset: number;
//   userId: string;
// }

interface EditorProps {
    pageId: string;
}

export function Editor({ pageId }: EditorProps) {
    const [blocks, setBlocks] = useState<BlockData[]>([]);
    const [ydoc] = useState(() => new Y.Doc());
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [showSlashMenu, setShowSlashMenu] = useState<boolean>(false);
    const [slashMenuBlockId, setSlashMenuBlockId] = useState<string | null>(null);
    const [slashMenuPosition, setSlashMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    // const [provider, setProvider] = useState<SimpleStompProvider | null>(null);
    const [awareness, setAwareness] = useState<any>(null);
    const userId = useRef(uuidv4()); // 为每个用户生成唯一ID
    const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set());

    // 添加一个处理光标更新的函数
    // const handleCursorChange = useCallback((blockId: string, offset: number) => {
    //     if (awareness) {
    //         awareness.setLocalState({
    //             user: {
    //                 id: userId.current,
    //                 cursor: {
    //                     blockId,
    //                     offset
    //                 }
    //             }
    //         });
    //     }
    // }, [awareness]);

    useEffect(() => {
        setIsLoading(true);
        const blocksArray = ydoc.getArray<string>('blocksArray');
        const blocksData: Y.Map<Y.Map<string>> = ydoc.getMap<Y.Map<string>>('blocksData');
        const provider = new SimpleStompProvider(
            'ws://forfries.com:8887/ws',
            pageId,
            ydoc
        );
    
        let initialized = false;

        provider.on('sync', (isSynced: boolean) => {
            if (isSynced && !initialized) {
                initialized = true;
                console.log('同步完成，当前blocks数量：', blocksArray.length);

                // 设置观察者来监听变化
                blocksArray.observe(() => {
                    const newBlocks: BlockData[] = [];
                    blocksArray.forEach((blockId) => {
                        const blockData = blocksData.get(blockId);
                        if (blockData) {
                            newBlocks.push({
                                id: blockData.get('id')!,
                                type: blockData.get('type')!,
                                content: blockData.get('content')!,
                            });
                        }
                    });
                    setBlocks(newBlocks);
                });

                // 如果已经有内容，直接触发一次更新
                const existingBlocks: BlockData[] = [];
                blocksArray.forEach((blockId) => {
                    const blockData = blocksData.get(blockId);
                    if (blockData) {
                        existingBlocks.push({
                            id: blockData.get('id')!,
                            type: blockData.get('type')!,
                            content: blockData.get('content')!,
                        });
                    }
                });
                setBlocks(existingBlocks);
                setIsLoading(false);
            }
        });

        return () => {
            provider.destroy();
            ydoc.destroy();
        };
    }, [pageId]);
    // useEffect(() => {
    //     localStorage.setItem('notionLikeBlocks', JSON.stringify(blocks));
    // }, [blocks]);
    // useEffect(() => {
    //     console.log("Updated blocks:", blocks);  // 每 blocks 更新时都会打印
    // }, [blocks]);
    //处理内容content改变的函数
    const handleBlockChange = useCallback((id: string, content: string) => {
        const blocksArray = ydoc.getArray<string>('blocksArray');
        console.log('handleBlockChange '+content)
        const blocksData:Y.Map<Y.Map<string>> = ydoc.getMap<Y.Map<string>>('blocksData');
        
        // 将所有操作包装在一个事务中
        ydoc.transact(() => {
            blocksArray.forEach((blockMap,index) => {
                if (blocksData.get(blockMap)!.get('id') === id) {
                    // 1. 更新内容
                    blocksData.get(blockMap)!.set('content', content);
                    // 2. 删除并重新插入以触发更新
                    blocksArray.delete(index,1);
                    blocksArray.insert(index,[blockMap]);
                }
            });
        });
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
    const addBlock = useCallback((type: string) => {
        // const newBlock: BlockData = { id: uuidv4(), type, content };
        // setBlocks(blocks => {
        //     console.log('Previous blocks:', blocks);  // 打印当前的 blocks 数组
        //     return [...blocks, newBlock];
        // });
        setShowSlashMenu(false);
        // console.log('Updated blocks:', blocks);  // 这会打印当前的 blocks，但因为 setBlocks 是异步的，所以这里的值不会被更新
        const blocksArray = ydoc.getArray<string>('blocksArray');
        const blocksData:Y.Map<Y.Map<string>>=ydoc.getMap<Y.Map<string>>('blocksData');
        const newBlockMap:Y.Map<string> = new Y.Map<string>();
        const id:string = uuidv4()
        // console.log(id);
        newBlockMap.set('id', id);
        newBlockMap.set('content', '');
        newBlockMap.set('type', type);
        // console.log(newBlockMap.get('id'));
        // console.log(newBlockMap.get('content'));
        // console.log(newBlockMap.get('type'));
        blocksData.set(id, newBlockMap);
        blocksArray.push([id]);
        
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

    const moveBlock = useCallback((dragIndex: number, hoverIndex: number) => {
        const blocksArray = ydoc.getArray<string>('blocksArray');
        
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
    }, [selectedBlocks]);
    const deleteBlock = useCallback((id: string) => {
        // console.log(id);
        const blocksArray = ydoc.getArray<string>('blocksArray');
        const blocksData:Y.Map<Y.Map<string>> = ydoc.getMap<Y.Map<string>>('blocksData');
        blocksArray.forEach((blockMap, indexArray) => {
        if (blockMap === id) {
            console.log('delete success');
            ydoc.transact(()=>{
                blocksData.delete(blockMap);
                blocksArray.delete(indexArray, 1);
            })
            
        }
        // console.log(blockMap);
    });
    }, []);

    const toggleBlockType = useCallback((id: string, newType: string) => {
        const blocksArray = ydoc.getArray<string>('blocksArray');
        const blocksData:Y.Map<Y.Map<string>>=ydoc.getMap<Y.Map<string>>('blocksData');
        
        // 将所有操作包装在一个事务中
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
    }, []);

    // 处理单击选择
    const handleBlockSelect = useCallback((blockId: string, e: MouseEvent) => {
        if (e.ctrlKey || e.metaKey) {
            // Ctrl/Cmd + 点击实现多选
            setSelectedBlocks(prev => {
                const newSelection = new Set(prev);
                if (newSelection.has(blockId)) {
                    newSelection.delete(blockId);
                } else {
                    newSelection.add(blockId);
                }
                return newSelection;
            });
        } else {
            // 普通点击只选择当前块
            setSelectedBlocks(new Set([blockId]));
        }
    }, []);

    // 处理拖拽选择
    const handleDragSelect = useCallback((e: any) => {
        const selected = e.selected.map((el: HTMLElement) => 
            el.getAttribute('data-block-id')
        ).filter(Boolean);
        
        if (e.inputEvent.ctrlKey || e.inputEvent.metaKey) {
            // Ctrl/Cmd + 拖拽实现添加选择
            setSelectedBlocks(prev => {
                const newSelection = new Set(prev);
                selected.forEach((id:string) => newSelection.add(id));
                return newSelection;
            });
        } else {
            // 普通拖拽替换选择
            setSelectedBlocks(new Set(selected));
        }
    }, []);

    // // 添加一个函数来检查用户权限
    // const checkUserPermissions = () => {
    //     const userType = localStorage.getItem('userType');
    //     const isGuest = userType === 'guest';
        
    //     // 可以根据需要限制游客的某些功能
    //     return {
    //         canEdit: true, // 所有用户都可以编辑
    //         canShare: !isGuest, // 只有非游客用户可以分享
    //         canExport: !isGuest, // 只有非游客用户可以导出
    //         // ... 其他权限
    //     };
    // };

    // // 在需要的地方使用权限检查
    // const permissions = checkUserPermissions();

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
                                        key={block.id}
                                        {...block}
                                        onChange={handleBlockChange}
                                        onFocus={handleBlockFocus}
                                        onBlur={handleBlockBlur}
                                        onDelete={deleteBlock}
                                        index={index}
                                        moveBlock={moveBlock}
                                        isSelected={selectedBlocks.has(block.id)}
                                        onSelect={handleBlockSelect}
                                        ydoc={ydoc}
                                    />
                                ) : (
                                    <Block
                                        key={block.id}
                                        {...block}
                                        onChange={handleBlockChange}
                                        onFocus={handleBlockFocus}
                                        onBlur={handleBlockBlur}
                                        onKeyDown={handleKeyDown}
                                        onDelete={deleteBlock}
                                        onToggleType={toggleBlockType}
                                        index={index}
                                        moveBlock={moveBlock}
                                        awareness={awareness}
                                        userId={userId.current}
                                        selectedBlockId={selectedBlockId}
                                        isSelected={selectedBlocks.has(block.id)}
                                        onSelect={handleBlockSelect}
                                        placeholder={index === 0 ? "输入标题..." : "按下 / 开始创作"}
                                    />
                                )
                            ))}
                        </div>
                        <Selecto
                            dragContainer={".relative"}
                            selectableTargets={["[data-block-id]"]}
                            hitRate={0}
                            selectByClick={false}
                            selectFromInside={false}
                            toggleContinueSelect={["shift"]}
                            ratio={0}
                            onSelect={handleDragSelect}
                            // style={{
                            //     position: "fixed",
                            //     zIndex: 999,
                            // }}
                            // selectBoxStyle={{
                            //     background: "rgba(59, 130, 246, 0.1)",
                            //     border: "1px solid rgba(59, 130, 246, 0.3)",
                            // }}
                        />

                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-4 text-gray-500 hover:text-gray-700"
                            onClick={() => addBlock('paragraph')}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add a block
                        </Button>
                        {selectedBlockId && (
                            <FloatingToolbar
                                blockId={selectedBlockId}
                                onToggleType={(type) => toggleBlockType(selectedBlockId, type)}
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
