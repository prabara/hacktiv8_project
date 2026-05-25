import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
// import fs from 'fs/promises';
import multer from "multer";
import express from 'express';

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});
const app = express();
const upload = multer();

const GEMINI_MODEL = "gemini-3.5-flash";

app.use(express.json());
app.use(express.static("public"));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

app.post('/api/chat', async (req, res) =>{
    const { conversation } = req.body;
    try {
        if(!Array.isArray(conversation)) throw new Error("Messange must be Array!");

        let isValid = true
        conversation.forEach(({role, text}) => {
            if(!isValid) return;
            if(!['model','user'].includes(role)){
                isValid = false;
            }
            if(!text|| typeof text !== 'string'){
                isValid = false;
            }
        });
        
        if (!isValid){
            return res.status(400).json({ message: "playload nggak  valid gan!"})
        }
        
        
        const contents = conversation.map(({role, text}) => ({
            role,
            parts: [{text}]
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                temperature: 0.2,
                systemInstruction: "Jawab hanya seputar jadwal sholat, jadwal puasa, ayat Al-Qur'an & informasi islami",
            },
        });
        res.status(200).json({ message: response.text });
    } catch (e) {
        res.status(500).json({ error : e.message});
    }
})