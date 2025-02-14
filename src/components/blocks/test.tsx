
// const saveSelection = () => {
//     const selection = window.getSelection();
//     if (!selection || !divRef.current) return;
//     const range = selection.getRangeAt(0);
//     if (divRef.current.contains(range.startContainer)) {
//         lastSelectionRef.current = {
//             offset: range.startOffset
//         };
//     }
// };
// const restoreSelection = useCallback(() => {
//     if (!lastSelectionRef.current || !divRef.current) return;
//     const selection = window.getSelection();
//     if (!selection) return;
//     const range = document.createRange();
//     const textNode = divRef.current.firstChild || divRef.current;
    
//     try {
//         range.setStart(textNode, lastSelectionRef.current.offset);
//         range.setEnd(textNode, lastSelectionRef.current.offset);
//         selection.removeAllRanges();
//         selection.addRange(range);
//     } catch (e) {
//         console.warn('Failed to restore selection:', e);
//     }
// }, []);
// useEffect(() => {
//         if (content) {
//             restoreSelection();//每次输入都要处理一次返回光标,待优化
//         }
//     }, [content, restoreSelection]);
//     const lastSelectionRef = useRef<{ startOffset: number; endOffset: number; textContent: string } | null>(null);
//         useEffect(() => {
//             if (!awareness) return;
            
//             const handleCursorUpdate = () => {
//               const selection = window.getSelection();
//               if (selection && divRef.current?.contains(selection.anchorNode)) {
//                 const range = selection.getRangeAt(0);
//                 awareness.setLocalState({
//                   user: {
//                     id: userId,
//                     cursor: {
//                       blockId: id,
//                       start: calculateTextOffset(divRef.current, range.startContainer, range.startOffset),
//                       end: calculateTextOffset(divRef.current, range.endContainer, range.endOffset)
//                     }
//                   }
//                 });
//               }
//             };
//             document.addEventListener('selectionchange', handleCursorUpdate);
//             return () => document.removeEventListener('selectionchange', handleCursorUpdate);
//           }, [awareness, id, userId]);