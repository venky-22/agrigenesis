import { HfInference } from "@huggingface/inference";

/**
 * Generates a "grown" version of the farm using real AI (Hugging Face)
 * @param {string} imageBase64 - Original image data URI
 * @param {string} prompt - Description of the crop/farm
 * @param {string} apiKey - HF API Token
 */
export const generateProImage = async (imageBase64, prompt, apiKey) => {
    if (!apiKey) throw new Error("API Key required for Pro Generation");

    const hf = new HfInference(apiKey);

    // Convert Data URI to Blob
    const res = await fetch(imageBase64);
    const blob = await res.blob();

    // Call Lookbook or similar strong Img2Img model
    // We use stable-diffusion-xl-refiner-1.0 or similar for good img2img
    // Note: HfInference 'imageToImage' helper is useful
    try {
        const resultBlob = await hf.imageToImage({
            model: "stabilityai/stable-diffusion-xl-base-1.0",
            inputs: blob,
            parameters: {
                prompt: `(high quality), (photorealistic), lush green farm field, ${prompt} plants growing, clear blue sky, highly detailed, 8k, agriculture, thriving crops`,
                negative_prompt: "blur, haze, barren, dry, desert, low quality, distortion, watermark",
                strength: 0.75, // Impact of the prompt on the original image (0.7-0.8 is usually good for structure preservation + change)
            }
        });

        return URL.createObjectURL(resultBlob);
    } catch (err) {
        console.error("HF Generation Error", err);
        throw err;
    }
};

/**
 * Generates a "grown" version using local Canvas manipulation (Smart Filter).
 * Preserves geometry 100% by just tinting the ground green.
 */
export const generateLocalGreenery = (imageElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = imageElement.naturalWidth || imageElement.width;
    const height = imageElement.naturalHeight || imageElement.height;

    canvas.width = width;
    canvas.height = height;

    // Draw original
    ctx.drawImage(imageElement, 0, 0, width, height);

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Simple heuristic: If pixel is "earthy" (brown/tan/grey), make it green.
    // Leave sky (blue/white) alone.
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Detect Earthy tones (R > B and G > B usually, or low saturation)
        // Detect Sky (B > R and B > G)

        // Very simple "Is not sky" check:
        if (!(b > r + 20 && b > g + 20)) {
            // It's likely ground/object.
            // Apply "Lush" transformation

            // Increase Green, Decrease Red/Blue slightly to shift to green spectrum
            // Blend with a nice "Leaf Green" (34, 197, 94)

            data[i] = r * 0.6 + 34 * 0.4;     // R
            data[i + 1] = g * 0.6 + 197 * 0.4;  // G (Boosted)
            data[i + 2] = b * 0.6 + 94 * 0.4;   // B
        }
    }

    ctx.putImageData(imageData, 0, 0);

    // Overlay a subtle texture pattern? (Optional)

    return canvas.toDataURL('image/jpeg', 0.9);
};
