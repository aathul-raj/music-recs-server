import OpenAI from 'openai';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import 'dotenv/config';

const app = express();

app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'https://music-recs-fe.vercel.app'],
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
    apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
});

app.get('/', (req, res) => {
    res.send('Working!');
});

// Endpoint for music recommendations
app.post('/recommend', async (req, res) => {
    const { type, items } = req.body; // type can be 'artists' or 'albums'
    try {
        const prompt = constructPrompt(type, items);

        // Updated completion creation
        const completion = await openai.chat.completions.create({ 
            model: "gpt-3.5-turbo",
            messages: [{role: "user", content: prompt}],
            max_tokens: 100,
            temperature: 0.7
        });

        // Updated response parsing
        console.log(completion);

        const recommendations = parseResponse(completion.choices[0].message.content);
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
    return `Based on the musical characteristics, themes, and styles of ${joinedItems}, recommend three ${type} that a fan of these might enjoy. The response must strictly adhere to the following format: "${type} 1, ${type} 2, ${type} 3" with no deviations. This means no additional analysis, comments, or information should be included - only the names of the three ${type}, exactly as requested. It is crucial that you do not repeat any of the ${type.toUpperCase()} mentioned earlier and that all recommendations are real and verifiable. Also, ensure that there are no periods, commas, or any other punctuation in the names of the albums or artists. Just provide the names in the exact format specified.`;
}


function parseResponse(responseText) {
    return responseText.split('\n').filter(item => item.trim() !== '').slice(0, 3);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
