/**
 * Browser Audio Recorder & WAV Encoder
 * Converts microphone audio into standard 16kHz 16-bit mono PCM WAV
 * for Gnani Prisma STT (https://api.vachana.ai/stt/v3)
 */

export class AudioRecorder {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private input: MediaStreamAudioSourceNode | null = null;
  private recordedBuffers: Float32Array[] = [];
  private isRecording: boolean = false;
  private sampleRate: number = 16000;

  public async start(): Promise<void> {
    this.recordedBuffers = [];
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioContextClass({ sampleRate: this.sampleRate });

    this.input = this.audioContext.createMediaStreamSource(this.mediaStream);
    // Buffer size 4096, 1 input channel, 1 output channel
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      if (!this.isRecording) return;
      const channelData = e.inputBuffer.getChannelData(0);
      this.recordedBuffers.push(new Float32Array(channelData));
    };

    this.input.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
    this.isRecording = true;
  }

  public async stop(): Promise<Blob> {
    this.isRecording = false;

    if (this.processor && this.input) {
      this.input.disconnect();
      this.processor.disconnect();
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      await this.audioContext.close();
    }

    // Merge all recorded Float32 chunks
    let totalLength = 0;
    for (const buf of this.recordedBuffers) {
      totalLength += buf.length;
    }

    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const buf of this.recordedBuffers) {
      merged.set(buf, offset);
      offset += buf.length;
    }

    // Convert to 16-bit PCM WAV Blob
    return this.encodeWAV(merged, this.sampleRate);
  }

  public cancel(): void {
    this.isRecording = false;

    if (this.processor && this.input) {
      this.input.disconnect();
      this.processor.disconnect();
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
    }

    this.recordedBuffers = [];
  }

  private encodeWAV(samples: Float32Array, sampleRate: number): Blob {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    this.writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, 1, true); // NumChannels (1 = mono)
    view.setUint32(24, sampleRate, true); // SampleRate (16000)
    view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
    view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
    view.setUint16(34, 16, true); // BitsPerSample (16 bits)

    // data sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);

    // Write PCM samples
    let index = 44;
    for (let i = 0; i < samples.length; i++) {
      let s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(index, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      index += 2;
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}
