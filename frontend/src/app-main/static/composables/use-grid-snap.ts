import { ref, Ref } from 'vue';
import { Position, GridConfig, AlignmentGuide, GraphicNode } from '../types';

export function useGridSnap(gridConfig: Ref<GridConfig>, nodes: Ref<GraphicNode[]>) {
    const alignmentGuides = ref<AlignmentGuide[]>([]);

    /**
     * Snap a position to the nearest grid point
     */
    const snapToGrid = (position: Position): Position => {
        const { size } = gridConfig.value;
        return {
            x: Math.round(position.x / size) * size,
            y: Math.round(position.y / size) * size
        };
    };

    /**
     * Check if position is close enough to snap
     */
    const shouldSnap = (position: Position, snappedPosition: Position): boolean => {
        const { snapThreshold } = gridConfig.value;
        const dx = Math.abs(position.x - snappedPosition.x);
        const dy = Math.abs(position.y - snappedPosition.y);
        return dx <= snapThreshold || dy <= snapThreshold;
    };

    /**
     * Calculate alignment guides based on current drag position
     */
    const calculateAlignmentGuides = (
        draggingNodeId: string,
        position: Position,
        size: { width: number; height: number }
    ): AlignmentGuide[] => {
        const guides: AlignmentGuide[] = [];
        const threshold = 5; // px threshold for alignment detection

        // Calculate key points of dragging node
        const dragLeft = position.x;
        const dragRight = position.x + size.width;
        const dragCenterX = position.x + size.width / 2;
        const dragTop = position.y;
        const dragBottom = position.y + size.height;
        const dragCenterY = position.y + size.height / 2;

        // Check alignment with other nodes
        nodes.value.forEach(node => {
            if (node.id === draggingNodeId) return;

            const nodeLeft = node.position.x;
            const nodeRight = node.position.x + node.size.width;
            const nodeCenterX = node.position.x + node.size.width / 2;
            const nodeTop = node.position.y;
            const nodeBottom = node.position.y + node.size.height;
            const nodeCenterY = node.position.y + node.size.height / 2;

            // Vertical alignment guides
            if (Math.abs(dragLeft - nodeLeft) < threshold) {
                guides.push({ type: 'vertical', position: nodeLeft, nodes: [node.id] });
            }
            if (Math.abs(dragRight - nodeRight) < threshold) {
                guides.push({ type: 'vertical', position: nodeRight, nodes: [node.id] });
            }
            if (Math.abs(dragCenterX - nodeCenterX) < threshold) {
                guides.push({ type: 'vertical', position: nodeCenterX, nodes: [node.id] });
            }

            // Horizontal alignment guides
            if (Math.abs(dragTop - nodeTop) < threshold) {
                guides.push({ type: 'horizontal', position: nodeTop, nodes: [node.id] });
            }
            if (Math.abs(dragBottom - nodeBottom) < threshold) {
                guides.push({ type: 'horizontal', position: nodeBottom, nodes: [node.id] });
            }
            if (Math.abs(dragCenterY - nodeCenterY) < threshold) {
                guides.push({ type: 'horizontal', position: nodeCenterY, nodes: [node.id] });
            }
        });

        return guides;
    };

    /**
     * Snap position to alignment guides if close enough
     */
    const snapToGuides = (
        position: Position,
        size: { width: number; height: number },
        guides: AlignmentGuide[]
    ): Position => {
        let snappedX = position.x;
        let snappedY = position.y;
        const threshold = 5;

        const centerX = position.x + size.width / 2;
        const centerY = position.y + size.height / 2;

        guides.forEach(guide => {
            if (guide.type === 'vertical') {
                // Check left edge
                if (Math.abs(position.x - guide.position) < threshold) {
                    snappedX = guide.position;
                }
                // Check right edge
                else if (Math.abs(position.x + size.width - guide.position) < threshold) {
                    snappedX = guide.position - size.width;
                }
                // Check center
                else if (Math.abs(centerX - guide.position) < threshold) {
                    snappedX = guide.position - size.width / 2;
                }
            } else {
                // Check top edge
                if (Math.abs(position.y - guide.position) < threshold) {
                    snappedY = guide.position;
                }
                // Check bottom edge
                else if (Math.abs(position.y + size.height - guide.position) < threshold) {
                    snappedY = guide.position - size.height;
                }
                // Check center
                else if (Math.abs(centerY - guide.position) < threshold) {
                    snappedY = guide.position - size.height / 2;
                }
            }
        });

        return { x: snappedX, y: snappedY };
    };

    return {
        alignmentGuides,
        snapToGrid,
        shouldSnap,
        calculateAlignmentGuides,
        snapToGuides
    };
}
