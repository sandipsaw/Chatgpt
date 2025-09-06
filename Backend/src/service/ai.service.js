const { GoogleGenAI } = require("@google/genai");

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({
  apiKey : process.env.GEMINI_API_KEY,
});

const generateRespone = async(content) =>{
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents:content,
    config:{
      systemInstruction:`
- No decorative symbols like *, •. use emoji only and  make sure new line is added when it needed.  
- Use plain text with simple line breaks or dashes.  
- Keep answers concise and under 6 lines if possible.  
- Focus only on actionable steps, practical explanations, or minimal code snippets.  
- Avoid long theory, filler sentences, or marketing language.  
- When showing code, ensure it is small, correct, and directly usable.  
- Prioritize clarity over style. 
Provide clean, step-by-step mathematical solutions:
- Use plain text without any emojis, bullet symbols, or decorative marks.  
- Show each substitution and simplification explicitly.  
- Keep formatting minimal: just line breaks or dashes, no special symbols for lists.  
- Use proper math notation in LaTeX form, and ensure each step logically follows the previous one.  
- Avoid adding extra commentary or unrelated explanations.  
- The final answer must be clearly stated in simplified form. `
    }
  });
  return response.text;
}


const generateVector = async(content)=>{
  const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: content,
        config:{
          outputDimensionality:768,
        }
    });

    return response.embeddings[0].values
}


module.exports = {generateRespone,generateVector}