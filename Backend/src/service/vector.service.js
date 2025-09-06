// Import the Pinecone library
const { Pinecone } = require('@pinecone-database/pinecone');

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const CohortChatGptIndex = pc.Index('cohort-chat-gpt')

const craeteMemory = async ({ messageId,vectors,metadata }) => {
    await CohortChatGptIndex.upsert(
        [{
            id: messageId,
            values: vectors,
            metadata
        }]
    )
}
console.log(craeteMemory);

const queryMemory = async ({ queryVector, metadata, limit = 5 }) => {
    const data = await CohortChatGptIndex.query({
            vector: queryVector,
            topk: limit,
            filter: metadata ? { metadata } : undefined,
            includeMetadata: true,
    })
}

module.exports = {craeteMemory,queryMemory}