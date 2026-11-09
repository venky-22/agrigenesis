// Shared AI client for every module (AgriGenesis, Crop Care, Climate Risk).
// Calls Adaption's Responses API through the Vite proxy at /api/adaption,
// which adds ADAPTION_API_KEY on the server side (see vite.config.js).

export const AI_ENABLED = Boolean(import.meta.env.HAS_ADAPTION);
export const TEXT_MODEL = 'gemma-4-31b-it';
export const VISION_MODEL = 'gemma-4-31b-it'; // accepts text + image

/**
 * @param {object} opts
 * @param {string} [opts.system]   system instructions
 * @param {Array<{role: 'user'|'assistant', content: string}>} [opts.history]
 * @param {string} opts.prompt     the user's message
 * @param {string} [opts.image]    image as a data URL (data:image/...;base64,...)
 * @param {number} [opts.temperature]
 * @param {number} [opts.maxTokens]
 * @returns {Promise<string>} the model's text output
 */
export async function aiText({ system, history = [], prompt, image, temperature = 0.5, maxTokens = 1500 }) {
    if (!AI_ENABLED) {
        throw new Error('AI is not configured. Add ADAPTION_API_KEY to .env and restart the dev server.');
    }

    const userContent = [{ type: 'input_text', text: prompt }];
    if (image) userContent.push({ type: 'input_image', image_url: image });

    const input = [
        ...history.map((m) => ({ type: 'message', role: m.role, content: m.content })),
        { type: 'message', role: 'user', content: userContent },
    ];

    const response = await fetch('/api/adaption/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: image ? VISION_MODEL : TEXT_MODEL,
            instructions: system,
            input,
            temperature,
            max_output_tokens: maxTokens,
        }),
    });

    if (!response.ok) {
        throw new Error(`Adaption API error ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return (data.output || [])
        .filter((item) => item.type === 'message')
        .flatMap((item) => item.content || [])
        .filter((part) => part.type === 'output_text')
        .map((part) => part.text)
        .join('')
        .trim();
}

/** Like aiText, but parses the reply as JSON (tolerates ```json fences and surrounding text). */
export async function aiJSON(opts) {
    const text = await aiText({
        ...opts,
        system: `${opts.system || ''}\nRespond with valid JSON only. No markdown, no code fences, no extra text.`.trim(),
    });
    return parseJSON(text);
}

export function parseJSON(text) {
    const clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const start = clean.search(/[[{]/);
    const end = Math.max(clean.lastIndexOf('}'), clean.lastIndexOf(']'));
    if (start === -1 || end === -1) throw new Error(`No JSON in model reply: ${clean.slice(0, 200)}`);
    return JSON.parse(clean.slice(start, end + 1));
}
