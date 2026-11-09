import { HfInference } from "@huggingface/inference";

// API_KEY passed dynamically
const VEO_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/veo-2.0-generate-preview:predictLongRunning";

/**
 * Generates a video using Veo (Primary) or HuggingFace (Fallback).
 * @param {string} imageBase64 
 * @param {string} prompt 
 * @param {object} keys - { geminiKey, hfToken }
 */
export const generateFarmVideo = async (imageBase64, prompt, keys) => {
    const { geminiKey, hfToken } = keys;

    // 1. Try Veo if Key exists
    if (geminiKey) {
        try {
            console.log("Attempting Veo Generation...");
            const opName = await startVeoOp(imageBase64, prompt, geminiKey);
            return await pollVeoStatus(opName, geminiKey);
        } catch (err) {
            console.warn("Veo Failed, trying fallback:", err);
            // Fallthrough to HS
        }
    }

    // 2. Try HuggingFace SVD
    if (hfToken) {
        try {
            console.log("Attempting HF SVD Generation...");
            return await generateHFVideo(imageBase64, hfToken);
        } catch (err) {
            console.warn("HF SVD Failed, using simulation:", err);
        }
    }

    // 3. Fallback: Simulation Mode (No keys required)
    console.log("Using Simulation Mode / Local Demo Video");

    // Simulate processing time (2.5 seconds) for realism
    await new Promise(resolve => setTimeout(resolve, 2500));

    return "/demo_farm.mp4"; // Returns local file path
};

const startVeoOp = async (imageBase64, prompt, apiKey) => {
    const cleanBase64 = imageBase64.split(',')[1];
    const payload = {
        instances: [{
            prompt: `Cinematic drone shot, transforming barren land into a lush futuristic farm with ${prompt}. High quality, photorealistic, 4k, slow camera pan.`,
            image: { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } }
        }]
    };

    const response = await fetch(`${VEO_BASE_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Veo Request Failed: ${err}`);
    }

    const data = await response.json();
    return data.name;
};

const pollVeoStatus = async (operationName, apiKey) => {
    const pollUrl = `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`;
    const maxAttempts = 36;
    let attempts = 0;

    while (attempts < maxAttempts) {
        const res = await fetch(pollUrl);
        const data = await res.json();
        if (data.done) {
            if (data.error) throw new Error(data.error.message);
            const videoUri = data.response?.generatedSamples?.[0]?.video?.uri;
            if (!videoUri) throw new Error("No valid URI in response");
            return videoUri;
        }
        attempts++;
        await new Promise(r => setTimeout(r, 5000));
    }
    throw new Error("Veo Timeout");
};

const generateHFVideo = async (imageBase64, token) => {
    const hf = new HfInference(token);
    const res = await fetch(imageBase64);
    const blob = await res.blob();

    // Using Stable Video Diffusion (best for img2vid)
    const videoBlob = await hf.imageToVideo({
        model: "stabilityai/stable-video-diffusion-img2vid-xt",
        inputs: blob,
        parameters: {
            motion_bucket_id: 127,
            noise_aug_strength: 0.1,
        }
    });

    return URL.createObjectURL(videoBlob);
};
