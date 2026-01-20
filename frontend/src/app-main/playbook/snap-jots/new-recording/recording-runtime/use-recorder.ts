import { computed, reactive, ref, onUnmounted } from 'vue'
import { format } from 'quasar'
import { Callbacks, RecorderState, RuntimeState } from './runtime-spec'
import ScreenRecorder from './stream-recorder'
import RecordingStore from '@/app-main/playbook/snap-jots/a-recording/recording-store'
import { useRouter } from 'vue-router'
import CanvasCompositor from './canvas-compositor'
import QNotify from '@/boot/q-notify'



function _combineStream(...streamList: MediaStream[]) {


  // Combine Tracks: Canvas Video + Mic Audio + System Audio
  const finalStream = new MediaStream();
  streamList.forEach(stream => {
    if (stream == null || stream == undefined) return;
    stream.getTracks().forEach(track => finalStream.addTrack(track));
  })
  return finalStream;
}

export default function useRecorder(screenStream: MediaStream, micStream: MediaStream) {

  const state: RecorderState = reactive({
    runtimeState: RuntimeState.INACTIVE,
    totalWatchTime: 0, // this is according to video object
    chunkList: [],
    totalRecordedBytes: 0,
  })


  const router = useRouter()
  const callbacks: Callbacks = {
    onStart() {
      state.runtimeState = RuntimeState.RECORDING;
    },
    async onStop() {
      state.runtimeState = RuntimeState.INACTIVE;
      const newId = RecordingStore.insert(state.chunkList, undefined);
      //route to recorded video playback
      await router.push({ name: 'playbook.a-recording', params: { 'recordingId': newId } });

    },
    onPause() {
      state.runtimeState = RuntimeState.PAUSED;
    },
    onResume() {
      state.runtimeState = RuntimeState.RECORDING;
    },
    onNextChunk(blob: Blob) {
      state.chunkList.push(blob);
      state.totalRecordedBytes += blob.size;
    },

    onError(evt: Event) {
      QNotify.negative({
        message: 'Recording error ' + evt,
        icon: 'error',
        timeout: 5000
      })
    }
  }

  const finalStream = _combineStream(screenStream, micStream);

  // Initialize Recorder with Composited Stream
  // 20s buckets
  const recorder = new ScreenRecorder(finalStream, 20, callbacks);

  onUnmounted(() => {
    // compositor.stop();
    recorder.stop();
  });

  return {
    state,
    recorder,
    //compositor // Return compositor in case we need to clean it up manually or externally
  }

}
