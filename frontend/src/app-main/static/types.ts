// Node types for the graphic post maker

export interface Position {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface Bounds extends Position, Size { }

export enum NodeType {
    TEXT = 'text',
    IMAGE = 'image'
}

export interface BaseNode {
    id: string;
    type: NodeType;
    position: Position;
    size: Size;
    rotation: number;
    zIndex: number;
}

export interface TextNode extends BaseNode {
    type: NodeType.TEXT;
    content: string;
    fontSize: 14 | 16 | 20 | 24 | 30 | 36;
    fontFamily: string;
    color: string;
    textAlign: 'left' | 'center' | 'right';
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    textDecoration: 'none' | 'underline';
    lineHeight: number;
    letterSpacing: number;
}

export interface ImageNode extends BaseNode {
    type: NodeType.IMAGE;
    src: string;
    filters: {
        brightness: number;
        contrast: number;
        saturation: number;
    };
    borderRadius: number;
    borderWidth: number;
    borderColor: string;
    shadowBlur: number;
    shadowColor: string;
}

export type GraphicNode = TextNode | ImageNode;

export interface CanvasState {
    nodes: GraphicNode[];
    selectedNodeId: string | null;
    canvasSize: Size;
    gridSize: number; // 4px
    showGrid: boolean;
}

export interface AlignmentGuide {
    type: 'horizontal' | 'vertical';
    position: number;
    nodes: string[]; // IDs of nodes aligned to this guide
}

export interface DragState {
    isDragging: boolean;
    nodeId: string | null;
    startPosition: Position;
    currentPosition: Position;
    offset: Position;
}

export interface GridConfig {
    size: number; // 4px
    snapThreshold: number; // Distance in px to trigger snap
    showGuides: boolean;
}
