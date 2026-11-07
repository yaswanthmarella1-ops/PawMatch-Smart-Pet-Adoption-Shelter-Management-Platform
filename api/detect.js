export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'No image provided' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Gemini API key not configured' });

    try {
        const base64Data = image.split(',')[1];
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Analyze this image. Identify the animal's species and likely breed. Estimate the age in years and months. Return a JSON object ONLY with format: { \"species\": \"Dog\", \"breed\": \"Labrador\", \"ageYears\": 3, \"ageMonths\": 0, \"confidence\": 95, \"alternatives\": [\"Golden Retriever\", \"Lab mix\"] }. Do not output markdown formatting, just JSON." },
                        { inline_data: { mime_type: "image/jpeg", data: base64Data } }
                    ]
                }]
            })
        });

        const data = await response.json();
        if (!data.candidates || !data.candidates[0].content) {
            throw new Error("Invalid response from Gemini");
        }
        
        const textResult = data.candidates[0].content.parts[0].text;
        const cleanJson = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
        
        res.status(200).json(JSON.parse(cleanJson));
    } catch (error) {
        console.error("Detection Error:", error);
        res.status(500).json({ error: 'Failed to detect animal', details: error.message });
    }
}