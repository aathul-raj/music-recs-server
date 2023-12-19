import OpenAI from 'openai';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';


const app = express();

app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173',],
    credentials: true
}));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(bodyParser.json());

// Updated initialization
const openai = new OpenAI({
    apiKey: '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',
});

// Endpoint for music recommendations
app.post('/recommend', async (req, res) => {
    const { type, items } = req.body; // type can be 'artists' or 'albums'
    try {
        const prompt = constructPrompt(type, items);

        // Updated completion creation
        const completion = await openai.completions.create({
            model: 'text-davinci-003',
            prompt: prompt,
            max_tokens: 100,
            temperature: 0.7
        });

        // Updated response parsing
        const recommendations = parseResponse(completion.choices[0].text);
        res.json(recommendations);
    } catch (error) {
        // Updated error handling
        if (error instanceof OpenAI.APIError) {
            res.status(error.status).send(error.message);
        } else {
            res.status(500).send(error.message);
        }
    }
});

function constructPrompt(type, items) {
    let joinedItems = items.join(', ');
    return `Based on the musical characteristics, themes, and styles of ${joinedItems}, recommend three ${type} that a fan of these might enjoy. Provide recommendations that are both fitting and but also exploratory to introduce the listener to new but related experiences - while occasional mainstream ${type} are fine, try to introduce them to new stuff as well. Please ONLY OUTPUT ${type.toUpperCase()}, NO ANALYSIS. The response should be in the EXACT format: "${type} 1, ${type} 2, ${type} 3". DO NOT REPEAT THE ${type.toUpperCase()} GIVEN TO YOU. Please only return three ${type}, period. Make sure they are real as well. This is the most important thing. Double check and MAKE SURE YOUR ${type.toUpperCase()} ARE REAL. FOLLOW THIS FORMATTING EXACTLY: OMIT ALL PERIODS AND COMMAS IN YOUR RESPONSE. Because of the way I'm formatting your response that will mess me up. Again, do not include a single period or comma in your response ESPECIALLY in the names of the albums/artists. Just omit it.`;
}


function parseResponse(responseText) {
    return responseText.split('\n').filter(item => item.trim() !== '').slice(0, 3);
}

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
