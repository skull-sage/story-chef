<template>
  <a-page class="bg-blue-grey-1">
    <div class="q-pa-md full-width flex justify-center">
      <AnimCanvas ref="animCanvasRef"
          @animation-start="startRecording"
          @animation-end="stopRecording"  />

    </div>
     <!-- <canvas ref="canvasRef" /> -->
    <template #stickyBottom>
      <div class="q-pa-md full-width flex justify-center">
        <a-btn action primary @click="startAnimation" label="Start Animation" />
      </div>
    </template>
  </a-page>
</template>
<script setup >
  import { ref, onMounted } from 'vue'
  import AnimCanvas from './anim-canvas.vue'

  const animCanvasRef = ref(null);
  let stream = undefined;
  let recorder = undefined;
  const chunks = [];

  onMounted(async () => {
    stream = await navigator.mediaDevices.getDisplayMedia({
      preferCurrentTab: true,
    });
    const [track] = stream.getVideoTracks();
    const captureTarget = document.querySelector("#anim-canvas");
    const restrictionTarget = await RestrictionTarget.fromElement(captureTarget);

    if ("RestrictionTarget" in self && "fromElement" in RestrictionTarget) {
      // Deriving a restriction target is supported.
      await track.restrictTo(restrictionTarget);
    } else {
      throw new Error("Restriction target is not supported");
    }
  })

  const startAnimation = () => {
    animCanvasRef.value?.start();
  }

  const startRecording = async () => {

    recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm; codecs="av01.2.19H.12.0.000.09.16.09.1, opus"',
      videoBitsPerSecond: 2500000,
    });
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `anim-recording-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      stream.getTracks().forEach((track) => track.stop());
    };
    recorder.start();

  }

  const stopRecording = () => {
    recorder.stop();
  }

</script>
