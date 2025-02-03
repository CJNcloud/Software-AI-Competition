export interface BlockProps {
    id: string
    type: string
    content: string
    onChange: (id: string, content: string) => void
    onFocus: (id: string) => void
    onBlur: (id: string|null) => void
    onDelete: (id: string) => void
    index: number
    moveBlock: (DragIndex: number, HoverIndex:  number) => void
    awareness?: any;
    userId: string;
    isSelected: boolean;
    onSelect: (id: string, e: MouseEvent) => void;
}
export interface TextBlockProps extends BlockProps{
    onKeyDown: (e: React.KeyboardEvent, id: string) => void
    placeholder?: string;
}
export interface ImageBlockProps extends BlockProps{
    adjustImage?: (x: number, y: number) => void
}