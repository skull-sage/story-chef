import { ref, Ref, onMounted, onUnmounted } from 'vue';
import { Position, DragState } from '../types';

export interface UseDragOptions {
    onDragStart?: (position: Position) => void;
    onDrag?: (position: Position) => void;
    onDragEnd?: (position: Position) => void;
    snapToGrid?: (position: Position) => Position;
}

export function useDrag(
    elementRef: Ref<HTMLElement | null>,
    options: UseDragOptions = {}
) {
    const dragState = ref<DragState>({
        isDragging: false,
        nodeId: null,
        startPosition: { x: 0, y: 0 },
        currentPosition: { x: 0, y: 0 },
        offset: { x: 0, y: 0 }
    });

    const handleMouseDown = (event: MouseEvent) => {
        if (!elementRef.value) return;

        event.preventDefault();
        event.stopPropagation();

        const rect = elementRef.value.getBoundingClientRect();
        const parentRect = elementRef.value.parentElement?.getBoundingClientRect();

        if (!parentRect) return;

        // Calculate offset from element's top-left corner
        dragState.value.offset = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };

        // Calculate position relative to parent
        const position = {
            x: rect.left - parentRect.left,
            y: rect.top - parentRect.top
        };

        dragState.value.startPosition = position;
        dragState.value.currentPosition = position;
        dragState.value.isDragging = true;

        options.onDragStart?.(position);

        // Add global listeners
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (!dragState.value.isDragging || !elementRef.value) return;

        const parentRect = elementRef.value.parentElement?.getBoundingClientRect();
        if (!parentRect) return;

        // Calculate new position relative to parent
        let newPosition = {
            x: event.clientX - parentRect.left - dragState.value.offset.x,
            y: event.clientY - parentRect.top - dragState.value.offset.y
        };

        // Apply grid snapping if provided
        if (options.snapToGrid) {
            newPosition = options.snapToGrid(newPosition);
        }

        dragState.value.currentPosition = newPosition;
        options.onDrag?.(newPosition);
    };

    const handleMouseUp = (event: MouseEvent) => {
        if (!dragState.value.isDragging) return;

        const finalPosition = dragState.value.currentPosition;
        dragState.value.isDragging = false;

        options.onDragEnd?.(finalPosition);

        // Remove global listeners
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    onMounted(() => {
        if (elementRef.value) {
            elementRef.value.addEventListener('mousedown', handleMouseDown);
        }
    });

    onUnmounted(() => {
        if (elementRef.value) {
            elementRef.value.removeEventListener('mousedown', handleMouseDown);
        }
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    });

    return {
        dragState,
        isDragging: () => dragState.value.isDragging
    };
}
