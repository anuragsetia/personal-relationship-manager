import { ExtractionResultSchema, type ExtractionResult } from './types';
import { EXTRACTION_SYSTEM_PROMPT, buildExtractionUserPrompt } from './prompts';
import type { AIProvider } from '@/stores/settingsStore';

export class AIExtractionError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'AIExtractionError';
  }
}

// Strip markdown code fences if the model wrapped its JSON output.
function extractJSON(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) return text.slice(start, end + 1);
  return text.trim();
}

function parseResponse(text: string): ExtractionResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJSON(text));
  } catch {
    throw new AIExtractionError('AI response was not valid JSON', text);
  }
  try {
    return ExtractionResultSchema.parse(parsed);
  } catch (err) {
    throw new AIExtractionError('AI response did not match expected schema', err);
  }
}

async function callClaude(
  model: string,
  apiKey: string,
  imageBase64: string,
  mimeType: string,
): Promise<ExtractionResult> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: EXTRACTION_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType, data: imageBase64 },
            },
            { type: 'text', text: buildExtractionUserPrompt() },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new AIExtractionError(`Claude API ${response.status}: ${body}`);
  }

  const data = await response.json() as { content?: { text?: string }[] };
  const text = data.content?.[0]?.text ?? '';
  return parseResponse(text);
}

async function callOpenAI(
  model: string,
  apiKey: string,
  imageBase64: string,
  mimeType: string,
): Promise<ExtractionResult> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            },
            { type: 'text', text: buildExtractionUserPrompt() },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new AIExtractionError(`OpenAI API ${response.status}: ${body}`);
  }

  const data = await response.json() as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content ?? '';
  return parseResponse(text);
}

async function callGemini(
  model: string,
  apiKey: string,
  imageBase64: string,
  mimeType: string,
): Promise<ExtractionResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: EXTRACTION_SYSTEM_PROMPT }] },
      contents: [
        {
          parts: [
            { inline_data: { mime_type: mimeType, data: imageBase64 } },
            { text: buildExtractionUserPrompt() },
          ],
        },
      ],
      generationConfig: { maxOutputTokens: 1024 },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new AIExtractionError(`Gemini API ${response.status}: ${body}`);
  }

  const data = await response.json() as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return parseResponse(text);
}

export async function extractFromDocument(
  provider: AIProvider,
  model: string,
  apiKey: string,
  imageBase64: string,
  mimeType: string,
): Promise<ExtractionResult> {
  try {
    switch (provider) {
      case 'claude':
        return await callClaude(model, apiKey, imageBase64, mimeType);
      case 'openai':
        return await callOpenAI(model, apiKey, imageBase64, mimeType);
      case 'gemini':
        return await callGemini(model, apiKey, imageBase64, mimeType);
    }
  } catch (err) {
    if (err instanceof AIExtractionError) throw err;
    throw new AIExtractionError('Extraction failed', err);
  }
}
