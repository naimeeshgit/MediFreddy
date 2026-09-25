/**
 * Gnani.ai Client Integration for Speech-To-Text (Prisma v2.5) & Text-To-Speech (Timbre v2.5)
 * Using API Key provided by user
 */

export const GNANI_API_KEY =
  process.env.GNANI_API_KEY ||
  'vach_1ytE2CY5X2DzQyWjcsFH0EaMxkixYy4X9Qfwfw2n6vO3vJMedixnGQ7patjve0ne18QuuOzuJ1fdjmzhj2bVXuPvVdwQrJCD_2c582f0279fcb1282c4c7e7f378a03b6';

export const GNANI_TTS_ENDPOINT = 'https://api.vachana.ai/api/v1/tts/inference';
export const GNANI_STT_ENDPOINT = 'https://api.vachana.ai/stt/v3';

export interface TTSRequestOptions {
  text: string;
  voice?: 'Nalini' | 'Deepak' | 'Bhavna' | 'Roopesh' | 'Vikrant' | 'Yashvi';
  language?: string; // 'en-IN', 'hi-IN', 'kn-IN', etc.
}

export interface TTSResponse {
  success: boolean;
  audioBase64?: string;
  mimeType?: string;
  durationEstimate?: number;
  error?: string;
}

export interface STTResponse {
  success: boolean;
  transcript: string;
  model?: string;
  latency?: number;
  error?: string;
}

/**
 * Synthesizes text into high-fidelity speech WAV using Gnani Timbre v2.5
 */
export async function synthesizeGnaniTTS(options: TTSRequestOptions): Promise<TTSResponse> {
  const { text, voice = 'Nalini', language = 'en-IN' } = options;

  if (!text || text.trim().length === 0) {
    return { success: false, error: 'Empty text supplied to TTS' };
  }

  // Clean markdown syntax or URLs for cleaner pronunciation
  const cleanText = text
    .replace(/\*([^*]+)\*/g, '$1') // remove markdown bold
    .replace(/_([^_]+)_/g, '$1')   // remove italics
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // markdown links
    .replace(/https?:\/\/\S+/g, 'link')
    .replace(/[#*`~]/g, ' ')
    .trim()
    .slice(0, 800); // safe limit for real-time speech

  try {
    const startTime = Date.now();
    const response = await fetch(GNANI_TTS_ENDPOINT, {
      method: 'POST',
      headers: {
        'X-API-Key-ID': GNANI_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'timbre-v2.5',
        voice,
        text: cleanText,
        language,
        audio_config: {
          container: 'wav',
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gnani TTS error response:', response.status, errText);
      return {
        success: false,
        error: `Gnani TTS API returned status ${response.status}: ${errText}`,
      };
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const audioBase64 = `data:audio/wav;base64,${buffer.toString('base64')}`;
    
    // Estimate duration: 48kHz, 16bit mono = ~96000 bytes/sec
    const durationEstimate = Math.max(1, Math.round(buffer.length / 96000));

    console.log(`[Gnani TTS] Generated ${buffer.length} bytes in ${Date.now() - startTime}ms for voice=${voice}`);
    return {
      success: true,
      audioBase64,
      mimeType: 'audio/wav',
      durationEstimate,
    };
  } catch (error: any) {
    console.error('Gnani TTS invocation failed:', error);
    return {
      success: false,
      error: error?.message || 'Gnani TTS connection error',
    };
  }
}

/**
 * Transcribes audio file buffer into text using Gnani Prisma v2.5
 */
export async function transcribeGnaniSTT(
  audioBuffer: Buffer,
  filename: string = 'recording.wav',
  languageCode: string = 'en-IN'
): Promise<STTResponse> {
  const startTime = Date.now();
  try {
    const boundary = '----GnaniFormBoundary' + Math.random().toString(36).substring(2);

    // Build standard multipart/form-data payload natively without external dependency bugs
    const fileHeader = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="audio_file"; filename="${filename}"\r\nContent-Type: audio/wav\r\n\r\n`
    );
    const langHeader = Buffer.from(
      `\r\n--${boundary}\r\nContent-Disposition: form-data; name="language_code"\r\n\r\n${languageCode}\r\n--${boundary}--\r\n`
    );

    const fullBody = Buffer.concat([fileHeader, audioBuffer, langHeader]);

    const response = await fetch(GNANI_STT_ENDPOINT, {
      method: 'POST',
      headers: {
        'X-API-Key-ID': GNANI_API_KEY,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: fullBody,
    });

    const data = await response.json();
    console.log(`[Gnani STT] Response status=${response.status} in ${Date.now() - startTime}ms:`, data);

    if (data.success && data.transcript !== undefined) {
      return {
        success: true,
        transcript: data.transcript || data.output?.literal || '',
        model: data.model || 'gnani-prisma-v2.5',
        latency: data.end_to_end_latency || (Date.now() - startTime) / 1000,
      };
    } else {
      return {
        success: false,
        transcript: '',
        error: data.message || JSON.stringify(data.detail) || 'STT transcription failed',
      };
    }
  } catch (error: any) {
    console.error('Gnani STT invocation failed:', error);
    return {
      success: false,
      transcript: '',
      error: error?.message || 'Gnani STT connection error',
    };
  }
}
