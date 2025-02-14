import React,{useEffect, RefObject} from "react";
const useTextStyling = (ref: RefObject<HTMLElement>, style: { length: number, attributes: { [key: string]: string[] } }[]) => {
    useEffect(() => {
      const applyStyles = () => {
        const selection = window.getSelection();
        if (!ref.current || !selection) return;
        
        // 使用 DOM Range API 直接应用样式
        style?.forEach(segment => {
          const range = document.createRange();
          // 根据 segment 的位置信息设置范围
          // 应用样式到指定文本范围
        });
      };
      
      applyStyles();
    }, [style, ref]);
  };