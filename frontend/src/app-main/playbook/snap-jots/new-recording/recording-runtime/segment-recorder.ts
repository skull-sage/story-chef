
import { reactive, shallowReactive } from "vue"
import { CONTENT_OPTIONS, RuntimeState, Callbacks } from "./runtime-spec";

const Kbps = 1024;
const Mbps = Kbps * Kbps;
const Sec = 1000;// milliseconds

export default class SegmentRecorder {
  recorder: MediaRecorder
  segmentSec: number = 20 * Sec; // default to 20s
  stream: MediaStream;
  timeOutId: any;
  cbs: Callbacks;
  internalState: RuntimeState; // private internal state. Not to be used with client code


  constructor(stream: MediaStream, segmentSec: number, cbs: Callbacks) {

    if (stream === undefined)
      throw new Error('no stream provided');

    this.stream = stream;
    this.cbs = cbs;
    this.segmentSec = segmentSec * Sec;
    this.internalState = RuntimeState.INACTIVE;
  }

  start() {
    if (this.internalState !== RuntimeState.INACTIVE)
      throw new Error('recorder already started & current state: ' + this.internalState);

    this.cbs.onStart();
    this.internalState = RuntimeState.RECORDING
    this.recordSegment();
  }

  // will read each data fragment of the same recorded video
  recordSegment() {
    this.recorder = this.#createRecorder(); // onstart, onerror hooked
    this.recorder.start();

    this.timeOutId = setTimeout(() => {
      // implicit stop, explicit stop is checked in onstop event with STOP_TRIGGERED
      this.recorder.stop();
      this.recordSegment();
    }, this.segmentSec);

  }



  stop() {
    // preset STOP_TRIGGERED so
    this.internalState = RuntimeState.STOP_TRIGGERED;
    clearTimeout(this.timeOutId);
    this.recorder.stop();

  }



  pause() {

    clearTimeout(this.timeOutId);
    this.recorder.pause();
    this.recorder.requestData();
    // notifying the caller about the paused dat
  }
  resume() {
    this.recorder.resume();
    this.recordSegment();
  }


  #createRecorder(): MediaRecorder {

    const recorder = new MediaRecorder(this.stream, CONTENT_OPTIONS);

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.cbs.onNextChunk(e.data) //this.state.chunkList.push({ data: evt.data, duration: undefined, timeCode: evt.timecode });
      }
    }

    recorder.onstop = (evt) => {
      if (this.internalState != RuntimeState.STOP_TRIGGERED)
        return;

      this.internalState = RuntimeState.INACTIVE;
      this.cbs.onStop();

      this.recorder.stream.getTracks().forEach(track => track.stop());
      this.recorder.onstop = null;
      this.recorder.ondataavailable = null;
      this.recorder = undefined;
    }


    recorder.onpause = (e) => {
      this.internalState = RuntimeState.PAUSED;
      this.cbs.onPause();
    }
    recorder.onresume = (e) => {
      this.internalState = RuntimeState.RECORDING;
      this.cbs.onResume();
    }

    recorder.onerror = (e) => {
      this.cbs.onError(e);
    }

    return recorder;
  }
}
