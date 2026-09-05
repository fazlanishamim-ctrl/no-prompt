import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// ---- Config -----------------------------------------------------------
const GEMINI_MODEL = 'gemini-2.5-flash-image';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Maps the app's format ids to Gemini's supported aspect ratio strings
const ASPECT_RATIO_MAP: Record<string, string> = {
  square: '1:1',
  portrait: '4:5',
  story: '9:16',
};

// ---- Prompt builder -----------------------------------------------------
// This is the piece you asked for: turns the dropdown selections + optional
// free-text instructions into one strong, structured edit instruction.
function buildPrompt(opts: {
  category: string;
  creativeType: string;
  style: string;
  scene: string;
  customInstructions: string;
}) {
  const { category, creativeType, style, scene, customInstructions } = opts;
  const lines: string[] = [];

  // 1. Hard constraint — the #1 failure mode of these models on product
  // photography is silently altering logos/text/proportions. State this
  // first and explicitly.
  lines.push(
    'You are photo-editing a real e-commerce product image, not generating new art. ' +
      'The exact product in the uploaded photo — its shape, proportions, logo, printed ' +
      'text, colors, and packaging — must remain fully unchanged and instantly recognizable ' +
      'as the same physical item. Do not redraw, restyle, or reinterpret the product itself.'
  );

  if (category && category !== 'Auto Detect') {
    lines.push(`Product category: ${category}.`);
  }

  lines.push(`Creative purpose: ${creativeType}.`);

  if (style && style !== 'Automatic') {
    lines.push(`Visual style direction: ${style}.`);
  }

  if (scene && scene !== 'Automatic') {
    lines.push(`Background / scene: ${scene}.`);
  } else {
    lines.push(
      'Background / scene: choose a background that best fits the product category ' +
        'and style above.'
    );
  }

  lines.push(
    'Replace the background with a professional, high-end advertising scene matching the ' +
      'direction above. Add realistic contact shadows, reflections, and lighting so the ' +
      'product looks physically placed in the scene, not pasted on top of it.'
  );

  if (customInstructions && customInstructions.trim()) {
    lines.push(`Additional client instructions — follow these closely: ${customInstructions.trim()}`);
  }

  lines.push(
    'Do not add any invented text, logos, or watermarks unless explicitly instructed above. ' +
      'Output one single polished, high-resolution advertising image.'
  );

  return lines.join(' ');
}

// ---- Route handler -------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server is missing GEMINI_API_KEY. Add it to your environment variables and redeploy.' },
        { status: 500 }
      );
    }

    const form = await req.formData();
    const file = form.get('image');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No image was uploaded.' }, { status: 400 });
    }

    const category = String(form.get('category') || 'Auto Detect');
    const creativeType = String(form.get('creativeType') || 'Product Launch');
    const style = String(form.get('style') || 'Automatic');
    const scene = String(form.get('scene') || 'Automatic');
    const format = String(form.get('format') || 'square');
    const customInstructions = String(form.get('customInstructions') || '');

    const prompt = buildPrompt({ category, creativeType, style, scene, customInstructions });
    const aspectRatio = ASPECT_RATIO_MAP[format] || '1:1';

    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type || 'image/png';

    const geminiRes = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ inlineData: { mimeType, data: base64Image } }, { text: prompt }],
          },
        ],
        generationConfig: {
          responseModalities: ['IMAGE'],
          imageConfig: { aspectRatio },
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini API error:', geminiRes.status, errText);
      return NextResponse.json(
        {
          error:
            'Image generation failed. This is almost always an invalid/missing API key, no billing enabled on the Google AI Studio project, or a rate limit. Check server logs for the raw error.',
        },
        { status: 502 }
      );
    }

    const data = await geminiRes.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p: any) => p.inlineData);

    if (!imagePart) {
      // Model responded but refused / returned text only — surface why if present
      const textPart = parts.find((p: any) => p.text)?.text;
      return NextResponse.json(
        {
          error:
            textPart ||
            'The model did not return an image. It may have declined the request — try adjusting your instructions.',
        },
        { status: 502 }
      );
    }

    const outMime = imagePart.inlineData.mimeType || 'image/png';
    const outData = imagePart.inlineData.data;

    return NextResponse.json({
      image: `data:${outMime};base64,${outData}`,
      promptUsed: prompt,
    });
  } catch (err: any) {
    console.error('Generate route error:', err);
    return NextResponse.json({ error: 'Unexpected server error. See server logs.' }, { status: 500 });
  }
}
