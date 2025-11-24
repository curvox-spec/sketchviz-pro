// This file runs on the Netlify server, where the API key is safe.
const { OpenAI } = require('openai');

// Netlify uses 'process.env' to safely access environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; 

// Initialize the OpenAI client with the secret key
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

exports.handler = async (event, context) => {
    // 1. Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const body = JSON.parse(event.body);
        const prompt = body.prompt;

        // 2. Call the DALL-E 3 API
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt + ", line art, minimalist sketch, black and white, whiteboard animation style",
            n: 1,
            size: "1024x1024",
            style: "vivid" // Good for bold sketches
        });

        // 3. Return the generated image URL to the browser
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                // Important for CORS: allow the browser app to receive the data
                'Access-Control-Allow-Origin': '*', 
            },
            body: JSON.stringify({
                imageUrl: response.data[0].url
            }),
        };
    } catch (error) {
        console.error('OpenAI Error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};