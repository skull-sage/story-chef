<template>
  <div class="post-static-editor">
    <toolbar
      @add-text="addTextNode"
      @add-image="addImageNode"
      @export="exportCanvas"
    />

    <div class="main-area">
      <top-bar
        :current-size="canvasState.canvasSize"
        @change-canvas-size="changeCanvasSize"
      />

      <div class="editor-content">
        <div class="canvas-wrapper">
        <canvas-grid
          :canvas-size="canvasState.canvasSize"
          :grid-size="canvasState.gridSize"
          :show-grid="canvasState.showGrid"
        >
          <!-- Alignment guides -->
          <alignment-guides :guides="alignmentGuides" />

          <!-- Text nodes -->
          <text-node
            v-for="node in textNodes"
            :key="node.id"
            :node="node"
            :is-selected="canvasState.selectedNodeId === node.id"
            @update:node="updateNode"
            @select="selectNode"
            @drag-start="handleDragStart"
            @drag="handleDrag"
            @drag-end="handleDragEnd"
          />

          <!-- Image nodes -->
          <image-node
            v-for="node in imageNodes"
            :key="node.id"
            :node="node"
            :is-selected="canvasState.selectedNodeId === node.id"
            @update:node="updateNode"
            @select="selectNode"
            @drag-start="handleDragStart"
            @drag="handleDrag"
            @drag-end="handleDragEnd"
          />
        </canvas-grid>
      </div>

      <properties-panel
        v-if="selectedNode"
        :selected-node="selectedNode"
        @update:node="updateNode"
        @delete-node="deleteNode"
        @close="canvasState.selectedNodeId = null"
      />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import TopBar from './top-bar.vue';
import CanvasGrid from './canvas-grid.vue';
import AlignmentGuides from './alignment-guides.vue';
import TextNode from './text-node.vue';
import ImageNode from './image-node.vue';
import PropertiesPanel from './properties-panel.vue';
import { useGridSnap } from './composables/use-grid-snap';
import { ref, computed } from 'vue';
import { toPng } from 'html-to-image';
import Toolbar from './toolbar.vue';
import  { TextNode as TextNodeType,
  ImageNode as ImageNodeType,
  NodeType,
  Position,
  Size,
  AlignmentGuide,
  CanvasState,
  GraphicNode
} from './types';

// Canvas state
const canvasState = ref<CanvasState>({
  nodes: [],
  selectedNodeId: null,
  canvasSize: { width: 1080, height: 1080 },
  gridSize: 16,
  showGrid: true
});

// Grid configuration
const gridConfig = ref({
  size: 16,
  snapThreshold: 8,
  showGuides: true
});

// Grid snapping composable
const { snapToGrid, calculateAlignmentGuides, snapToGuides } = useGridSnap(
  gridConfig,
  computed(() => canvasState.value.nodes)
);

// Alignment guides state
const alignmentGuides = ref<AlignmentGuide[]>([]);
const draggingNodeId = ref<string | null>(null);

// Computed properties
const textNodes = computed(() =>
  canvasState.value.nodes.filter((n): n is TextNodeType => n.type === NodeType.TEXT)
);

const imageNodes = computed(() =>
  canvasState.value.nodes.filter((n): n is ImageNodeType => n.type === NodeType.IMAGE)
);

const selectedNode = computed(() =>
  canvasState.value.nodes.find(n => n.id === canvasState.value.selectedNodeId) || null
);

// Node creation
const addTextNode = () => {
  const newNode: TextNodeType = {
    id: `text-${Date.now()}`,
    type: NodeType.TEXT,
    position: { x: 100, y: 100 },
    size: { width: 200, height: 60 },
    rotation: 0,
    zIndex: canvasState.value.nodes.length + 1,
    content: 'Double click to edit',
    fontSize: 24,
    fontFamily: 'Arial, sans-serif',
    color: '#000000',
    textAlign: 'left',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    lineHeight: 1.2,
    letterSpacing: 0
  };

  canvasState.value.nodes.push(newNode);
  canvasState.value.selectedNodeId = newNode.id;
};

const addImageNode = () => {
  const newNode: ImageNodeType = {
    id: `image-${Date.now()}`,
    type: NodeType.IMAGE,
    position: { x: 150, y: 150 },
    size: { width: 300, height: 300 },
    rotation: 0,
    zIndex: canvasState.value.nodes.length + 1,
    src: '',
    filters: {
      brightness: 100,
      contrast: 100,
      saturation: 100
    },
    borderRadius: 0,
    borderWidth: 0,
    borderColor: '#000000',
    shadowBlur: 0,
    shadowColor: 'rgba(0, 0, 0, 0.5)'
  };

  canvasState.value.nodes.push(newNode);
  canvasState.value.selectedNodeId = newNode.id;
};

// Node management
const updateNode = (updatedNode: GraphicNode) => {
  const index = canvasState.value.nodes.findIndex(n => n.id === updatedNode.id);
  if (index !== -1) {
    canvasState.value.nodes[index] = updatedNode;
  }
};

const deleteNode = (nodeId: string) => {
  canvasState.value.nodes = canvasState.value.nodes.filter(n => n.id !== nodeId);
  if (canvasState.value.selectedNodeId === nodeId) {
    canvasState.value.selectedNodeId = null;
  }
};

const selectNode = (nodeId: string) => {
  canvasState.value.selectedNodeId = nodeId;
};

// Drag handlers
const handleDragStart = (nodeId: string) => {
  draggingNodeId.value = nodeId;
  selectNode(nodeId);
};

const handleDrag = (position: Position) => {
  if (!draggingNodeId.value) return;

  const node = canvasState.value.nodes.find(n => n.id === draggingNodeId.value);
  if (!node) return;

  // Calculate alignment guides
  const guides = calculateAlignmentGuides(draggingNodeId.value, position, node.size);
  alignmentGuides.value = guides;

  // Snap to guides if close enough
  let snappedPosition = snapToGuides(position, node.size, guides);

  // Then snap to grid
  snappedPosition = snapToGrid(snappedPosition);

  // Update node position
  updateNode({
    ...node,
    position: snappedPosition
  });
};

const handleDragEnd = (position: Position) => {
  draggingNodeId.value = null;
  alignmentGuides.value = [];
};

// Canvas management
const changeCanvasSize = (size: Size) => {
  canvasState.value.canvasSize = size;
};

// Export functionality
const exportCanvas = async () => {
  const canvasElement = document.querySelector('.canvas-grid') as HTMLElement;
  if (!canvasElement) return;

  try {
    const dataUrl = await toPng(canvasElement, {
      width: canvasState.value.canvasSize.width,
      height: canvasState.value.canvasSize.height,
      backgroundColor: '#ffffff'
    });

    // Download the image
    const link = document.createElement('a');
    link.download = `graphic-post-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Failed to export canvas:', error);
  }
};
</script>

<style scoped>
.post-static-editor {
  display: flex;
  flex-direction: row;
  height: 100vh;
  background-color: #f5f5f5;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  flex-direction: row;
}

.canvas-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  overflow: auto;
}
</style>
