
export default class CanvasCompositor {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  screenVideo: HTMLVideoElement;
  camVideo: HTMLVideoElement;
  screenStream: MediaStream;
  camStream: MediaStream;
  isActive: boolean = false;
  animationFrameId: number;

  constructor(screenStream: MediaStream, camStream: MediaStream) {
    this.screenStream = screenStream;
    this.camStream = camStream;

    this.canvas = document.createElement('canvas');
    // Set initial size, will be updated based on screen stream
    this.canvas.width = 1920;
    this.canvas.height = 1080;

    this.ctx = this.canvas.getContext('2d', { alpha: false }); // Alpha false for performance

    this.screenVideo = document.createElement('video');
    this.screenVideo.muted = true;
    this.screenVideo.autoplay = true;
    this.screenVideo.srcObject = screenStream;

    this.camVideo = document.createElement('video');
    this.camVideo.muted = true;
    this.camVideo.autoplay = true;
    this.camVideo.srcObject = camStream;

    // Wait for metadata to resize canvas to match screen resolution ideally
    this.screenVideo.onloadedmetadata = () => {
      this.canvas.width = this.screenVideo.videoWidth;
      this.canvas.height = this.screenVideo.videoHeight;
    }

    this.startLoop();
  }

  startLoop() {
    this.isActive = true;

    const draw = () => {
      if (!this.isActive) return;

      // Draw Screen (Background)
      if (this.screenVideo.readyState === this.screenVideo.HAVE_ENOUGH_DATA) {
        this.ctx.drawImage(this.screenVideo, 0, 0, this.canvas.width, this.canvas.height);
      } else {
        // Fallback or loading state? For now, black frame or clear
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }

      // Draw Camera (PIP - Top Right)
      if (this.camStream && this.camVideo.readyState === this.camVideo.HAVE_ENOUGH_DATA) {
        const pipWidth = 200//this.canvas.width * 0.20; // 20% of width
        // Maintain aspect ratio
        //const aspectRatio = this.camVideo.videoWidth / this.camVideo.videoHeight;
        const pipHeight = 200//pipWidth / (aspectRatio || (16 / 9));

        const padding = 20;
        const x = this.canvas.width - pipWidth - padding;
        const y = padding;

        // Draw rounded rect clip or border could go here, for now just simple rect
        this.ctx.drawImage(this.camVideo, x, y, pipWidth, pipHeight);
      }

      this.animationFrameId = requestAnimationFrame(draw);
    }

    draw();
  }

  getStream(): MediaStream {
    const fps = 30;
    return this.canvas.captureStream(fps);
  }

  stop() {
    this.isActive = false;
    cancelAnimationFrame(this.animationFrameId);
    // We generally don't stop input streams here as they might be managed elsewhere,
    // but we should detach them from video elements.
    this.screenVideo.srcObject = null;
    this.camVideo.srcObject = null;

    // Optional: stop tracks if we own them, but usually InputStore owns them.
  }
}
