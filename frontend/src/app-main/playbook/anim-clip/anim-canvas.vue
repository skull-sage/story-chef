<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { createTimeline, random } from 'animejs'
import { renderCanvasFrame } from './elm-recorder';

const emit = defineEmits<{
  'animation-start': []
  'animation-end': []
}>()

const props = defineProps(['canvasElm']);

const animRef = ref<HTMLElement | null>(null);
function animateShapes() {
  const tl = createTimeline({
    frameRate: 30,
    loop: 1,
    onBegin: () => {
      emit('animation-start')
    },
    onComplete: () => {
      emit('animation-end')
    }
  })

  // Circle: fadeIn
  tl.add('.shape.circle', {
    opacity: [0, 1],
    duration: 300,

  })

  // Circle: move randomly
  tl.add('.shape.circle', {
    x: 300, // Random between -200 and 200
    y: 300,
    duration: 500,
    easing: 'inOut(2)'
  }, '+=0')



  // Square: fadeIn
  tl.add('.shape:not(.circle)', {
    opacity: [0, 1],
    duration: 500,
    easing: 'out(2)'
  }, '+=0')

  // Square: move randomly
  tl.add('.shape:not(.circle)', {
    x: 0, // Random between 50 and 400
    y: 600,
    duration: 1000,
    easing: 'inOut(2)'
  }, '+=0')

  // Square: move randomly
  tl.add('.shape:not(.circle)', {
    rotate: random(-180, 180),
    duration: 1000,
    easing: 'inOut(2)'
  }, '+=0')

}

defineExpose({
  start: animateShapes
})
</script>

<template>
  <div ref="animRef" id="anim-canvas" class="canvas-main shadow-1 bg-white relative-position">
     <div class="shape center position-absolute circle " ></div>
     <div class="shape bg-blue-1 bottom center position-absolute"  ></div>
  </div>


</template>

<style scoped lang="scss">

#anim-canvas{
   isolation: isolate;

}
.canvas-main{
  --cavas-width: 340px;
  width: var(--cavas-width);
  height: calc(var(--cavas-width) * 16/9);
  position: absolute;
  overflow: hidden;
}

.shape {

  display: inline-block;
  width: 100px;
  height: 100px;
  will-change: transform;
  opacity: 0;
}

.shape.circle {
  border-radius: 50%;
  background: linear-gradient(135deg, $red-11 0%, $purple-11 100%);
}


</style>
