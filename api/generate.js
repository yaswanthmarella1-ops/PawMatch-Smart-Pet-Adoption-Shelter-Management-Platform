export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { species, breed, name } = req.body;
    const hfApiKey = process.env.HF_API_KEY; // Optional

    try {
        const prompt = `Realistic portrait photo of a ${breed} ${species} named ${name}, shelter adoption photo, soft lighting, highly detailed, 4k`;
        
        // 1. Try Hugging Face if API key is provided
        if (hfApiKey) {
            const hfRes = await fetch("https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell", {
                headers: { Authorization: `Bearer ${hfApiKey}`, "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({ inputs: prompt }),
            });
            
            if (hfRes.ok) {
                const arrayBuffer = await hfRes.arrayBuffer();
                const base64 = Buffer.from(arrayBuffer).toString('base64');
                const dataUrl = `data:image/jpeg;base64,${base64}`;
                return res.status(200).json({ images: [dataUrl, dataUrl, dataUrl] });
            }
        }

        // 2. Fallback to Pollinations (Free, no key needed)
        const seed = Math.floor(Math.random() * 1000000);
        const images = [
            `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=600&height=600&nologo=true&seed=${seed}`,
            `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=600&height=600&nologo=true&seed=${seed + 1}`,
            `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=600&height=600&nologo=true&seed=${seed + 2}`
        ];

        res.status(200).json({ images });
    } catch (error) {
        console.error("Generation Error:", error);
        res.status(500).json({ error: 'Failed to generate images' });
    }
}