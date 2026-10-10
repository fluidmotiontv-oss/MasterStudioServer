import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy initialize Gemini client to prevent startup crash if key missing
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({ apiKey });
}

// 1. Quick AI Analysis API (gemini-3.5-flash)
app.post('/api/analyze-asset', async (req, res) => {
  try {
    const { imageBase64, imageName } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 is required' });
    }

    const ai = getGeminiClient();
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: 'image/png',
            data: cleanBase64,
          },
        },
        `Analyze this PNG image named "${imageName || 'Asset'}". Return a JSON object strictly matching this schema:
{
  "title": "Descriptive title",
  "category": "3D Asset" | "Badge/Icon" | "Game UI" | "Mascot/Element" | "Illustration",
  "description": "2-sentence visual description of style, colors, and design details",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "suggestedPhysics": "float" | "tilt3d" | "bounce" | "magnetic" | "particle" | "orbit",
  "altText": "Detailed accessibility text describing the image",
  "recommendedStyles": ["Cyberpunk Neon", "3D Claymation", "Glassmorphism", "Pixel Art", "Gold Metallic"]
}`,
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const json = JSON.parse(text);
    return res.json({ success: true, data: json });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Analysis failed';
    console.error('Error analyzing asset:', errMessage);
    return res.status(500).json({ success: false, error: errMessage });
  }
});

// 2. High Thinking Deep Architectural Analysis API (gemini-3.1-pro-preview with thinkingLevel HIGH)
app.post('/api/think-deep-analysis', async (req, res) => {
  try {
    const { imageBase64, userPrompt } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 is required' });
    }

    const ai = getGeminiClient();
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: [
        {
          inlineData: {
            mimeType: 'image/png',
            data: cleanBase64,
          },
        },
        `Perform deep architectural, interactive physics, and design disassembly of this PNG asset.
User Focus Query: "${userPrompt || 'Analyze vector structure, layer separation, physics springs, particle systems, and Framer Motion code'}"

Provide a detailed response in JSON format with fields:
{
  "thinkingSummary": "Detailed multi-step breakdown of visual composition, focal points, material properties, and layer boundaries",
  "recommendedPhysics": {
    "type": "tilt3d" | "bounce" | "magnetic" | "float" | "orbit" | "particle",
    "stiffness": number (50 to 300),
    "damping": number (5 to 30),
    "mass": number (0.5 to 2.5),
    "scaleOnHover": number (1.05 to 1.3),
    "tiltAmount": number (10 to 40),
    "particleColor": "hex string",
    "soundType": "pop" | "chime" | "click" | "hum" | "laser" | "crystal"
  },
  "layerDisassembly": [
    { "layer": "Background/Ambient Glow", "technique": "Radial blur pass with key color" },
    { "layer": "Primary Object Contour", "technique": "Alpha mask isolation with vector path trace" },
    { "layer": "Specular Highlight / Reflection", "technique": "Linear gradient overlay with screen blend" }
  ],
  "framerMotionCode": "Complete clean React + Framer Motion JSX component snippet for this smart asset"
}`,
      ],
      config: {
        thinkingConfig: {
          thinkingLevel: 'HIGH' as any,
        },
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const json = JSON.parse(text);
    return res.json({ success: true, data: json });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Deep thinking analysis failed';
    console.error('Error in deep thinking mode:', errMessage);
    return res.status(500).json({ success: false, error: errMessage });
  }
});

// 3. AI Variant & High Quality Image Generation API (gemini-3-pro-image-preview)
app.post('/api/generate-variant', async (req, res) => {
  try {
    const { prompt, style, resolution } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGeminiClient();
    const fullPrompt = `A high quality, isolated PNG asset on clean transparent/white background. Style: ${style || '3D Render'}. Description: ${prompt}. Resolution target: ${resolution || '2K'}. Professional game icon/ui element studio quality.`;

    // Call Imagen / Image Generation model
    const response = await ai.models.generateImages({
      model: 'gemini-3-pro-image-preview',
      prompt: fullPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const imgBytes = response.generatedImages[0].image.imageBytes;
      const dataUrl = `data:image/png;base64,${imgBytes}`;
      return res.json({ success: true, imageDataUrl: dataUrl, resolution });
    }

    throw new Error('No image was generated by the model.');
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Image generation failed';
    console.error('Error generating image variant:', errMessage);
    return res.status(500).json({ success: false, error: errMessage });
  }
});

// 4. Google Drive API Helper Endpoints
app.get('/api/drive/files', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header with Bearer token is required' });
    }

    const response = await fetch('https://www.googleapis.com/drive/v3/files?q=mimeType%20contains%20%27image%2F%27%20and%20trashed%3Dfalse&fields=files(id,name,mimeType,thumbnailLink,webContentLink,iconLink)', {
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Drive API error: ${errText}`);
    }

    const data = await response.json();
    return res.json({ success: true, files: data.files || [] });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Failed to fetch Drive files';
    return res.status(500).json({ success: false, error: errMessage });
  }
});

app.post('/api/drive/upload', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header with Bearer token is required' });
    }

    const { fileName, fileContentBase64, mimeType } = req.body;
    if (!fileName || !fileContentBase64) {
      return res.status(400).json({ error: 'fileName and fileContentBase64 are required' });
    }

    const cleanBase64 = fileContentBase64.replace(/^data:.*?;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    const metadata = {
      name: fileName,
      mimeType: mimeType || 'image/png',
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([buffer], { type: mimeType || 'image/png' }));

    const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
      },
      body: form,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`Google Drive Upload error: ${errText}`);
    }

    const uploadedData = await uploadRes.json();
    return res.json({ success: true, file: uploadedData });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Drive upload failed';
    return res.status(500).json({ success: false, error: errMessage });
  }
});

// Vite Middleware & Static Server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Asset Studio Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
