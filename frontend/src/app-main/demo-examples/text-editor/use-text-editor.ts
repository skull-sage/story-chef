import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue';

export function useTextEditor(rootElement: Ref<HTMLElement | null>) {
    const selectionState = ref<any>(null);

    function calcTextSelection(selRange: Range, childList: HTMLCollection | Element[]) {
        let { startContainer, startOffset, endContainer, endOffset } = selRange;

        let start = null;
        let end = null;

        // Helper to find which child contains the node
        const findChildIndex = (node: Node) => {
            for (let idx = 0; idx < childList.length; idx++) {
                if (childList[idx].contains(node)) {
                    return idx;
                }
            }
            return -1;
        };

        // If container is checking against the root's children, we might need to be careful
        // But assuming the selection is inside the text nodes which are inside the spans (children)

        for (let idx = 0; idx < childList.length; idx++) {
            let child = childList[idx];
            if (child.contains(startContainer)) {
                start = { inlineIdx: idx, offset: startOffset };
            }
            if (child.contains(endContainer)) {
                end = { inlineIdx: idx, offset: endOffset };
            }
        }

        return { start, end };
    }

    const updateSelection = () => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) {
            selectionState.value = null;
            return;
        }

        // Check if selection is inside our root element
        if (rootElement.value && !rootElement.value.contains(sel.anchorNode)) {
            // Selection is outside this editor instance
            return;
        }

        const range = sel.getRangeAt(0);

        if (rootElement.value) {
            const children = rootElement.value.children;
            const selection = calcTextSelection(range, children);

            let focusXY = null;
            if (sel.focusNode) {
                const targetElement = sel.focusNode.nodeType === Node.TEXT_NODE
                    ? (sel.focusNode.parentElement as Element)
                    : (sel.focusNode as Element);

                if (targetElement && targetElement.getBoundingClientRect) {
                    const rect = targetElement.getBoundingClientRect();
                    focusXY = { x: rect.left, y: rect.top };
                }
            }

            selectionState.value = { ...selection, focusXY };
        }
    };

    onMounted(() => {
        document.addEventListener('selectionchange', updateSelection);
    });

    onBeforeUnmount(() => {
        document.removeEventListener('selectionchange', updateSelection);
    });

    return {
        selectionState,
        updateSelection
    };
}
