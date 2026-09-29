import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI with recommended telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-memory cache for audio base64 so repeated lines play instantly with 0ms delay
const audioCache = new Map<string, string>();

/**
 * High-Quality Voice Synthesis (Neural TTS - 50-year-old wise Egyptian male scholar)
 * Uses Google Gemini 3.8 Flash Lite TTS with Charon voice (deep resonant mature male)
 */
app.post('/api/tts', async (req, res) => {
  try {
    const { text, speaker = 'scholar_50' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text string is required' });
    }

    const cleanText = text.trim();
    const cacheKey = `${speaker}:${cleanText}`;

    if (audioCache.has(cacheKey)) {
      return res.json({ audioBase64: audioCache.get(cacheKey) });
    }

    // Call gemini-3.8-flash-lite-tts
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: 'Mature, warm, wise 50-year-old Egyptian historian scholar, deep resonant reassuring voice, articulate and crystal-clear Egyptian Arabic',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            // Charon and Fenrir are deep mature male voices
            prebuiltVoiceConfig: { voiceName: 'Charon' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
      audioCache.set(cacheKey, base64Audio);
      return res.json({ audioBase64: base64Audio });
    } else {
      return res.status(500).json({ error: 'No audio returned from TTS engine' });
    }
  } catch (error: any) {
    console.error('Server TTS error:', error?.message || error);
    return res.status(500).json({ error: error?.message || 'TTS generation failed' });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Mount Vite middleware for dev or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
