const Kbps = 1024;
const Mbps = Kbps * Kbps;
const Sec = 1000;// milliseconds

// for standard recording according to gathered knowledge
export const CONTENT_OPTIONS = {
  mimeType: 'video/webm; codecs="av01.2.19H.12.0.000.09.16.09.1, opus"', // 4 - 6.9mb size
  // mimeType: 'video/webm; codecs="h264, opus"',
  // mimeType: 'video/mp4;codecs=avc1.42E01F,mp4a.40.2',
  bitsPerSecond: 1500 * Kbps, // MDN recommendation 800 * Mbps,
  audioBitrateMode: 'constant'
}

export enum RuntimeState {
  INACTIVE = 'inactive',
  RECORDING = 'recording',
  PAUSED = 'paused',
  STOP_TRIGGERED = 'stop_triggered', // to be used by Chunk recorder internally
}

export type ChunkInfo = {
  data: Blob,
  duration?: number, // in seconds
}

export type RecorderState = {
  runtimeState: RuntimeState,
  totalWatchTime: number, // this is according to video object
  chunkList: Blob[],
  totalRecordedBytes: number
}

export type Callbacks = {
  onNextChunk: (blob: Blob) => void,
  onStart: () => void,
  onStop: () => void,
  onPause: () => void,
  onResume: () => void,
  onError: (evt: Event) => void
}
