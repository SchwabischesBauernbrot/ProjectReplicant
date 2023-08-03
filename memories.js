const {ChromaClient, OpenAIEmbeddingFunction} = require('chromadb');
const fs = require('fs');

require('dotenv').config()

let botName = process.env.SUBJECT_NAME;
let oaiKey = process.env.OPENAI_API_KEY;
const dbClient = new ChromaClient();

const embedder = new OpenAIEmbeddingFunction({openai_api_key: oaiKey})
let collection;
const inputFile = './combined-output/formatted-output.json';

let jsonData = fs.readFileSync(inputFile);
let jsonObject = JSON.parse(jsonData);

async function main(){
    collection = await dbClient.getCollection({name: 'memories', embeddingFunction: embedder});
    const interactions = createInteractions(jsonObject);
    console.log(interactions);
    await addInteractions(interactions);
    console.log(await collection.get(
        include=["documents"]
    ))
}

function createInteractions(messages) {
    const interactions = [];
    let interaction = {incoming: [], outgoing: null, origin: null};
    for (const message of messages) {
        if (message.name === botName) {
            // Only assign to 'outgoing' if it's the same origin
            if(interaction.origin === message.origin || interaction.origin === null) {
                if (interaction.outgoing) {
                    // Finish current interaction if an outgoing message already exists
                    interactions.push(interaction);
                    interaction = {incoming: [], outgoing: null, origin: message.origin};
                }
                interaction.outgoing = message;
            } else {
                // Reset interaction if different origin is encountered
                interaction = {incoming: [], outgoing: message, origin: message.origin};
            }
        } else {
            // Add incoming message to current interaction, if it's the same origin
            if (interaction.origin === message.origin || interaction.origin === null) {
                interaction.incoming.push(message);
                // Update the origin if it's the first message
                if (interaction.origin === null) {
                    interaction.origin = message.origin;
                }
            } else {
                // Finish current interaction and start new one if different origin is encountered
                interactions.push(interaction);
                interaction = {incoming: [message], outgoing: null, origin: message.origin};
            }
        }
    }
    
    // Add last interaction if it wasn't added in the loop
    if (interaction.incoming.length > 0 || interaction.outgoing) {
        interactions.push(interaction);
    }

    return interactions;
}
main();

async function addInteractions(interactions) {
    for (let interaction of interactions) {
        let id = 0;
        let incoming = interaction.incoming;
        let outgoing = interaction.outgoing;
        let origin = interaction.origin;
        let ids = [];
        let metadata = [];
        let documents = [];
        for(let message of incoming) {
            ids.push(`id${id}`);
            metadata.push({name: message.name, timestamp: message.timestamp, origin: origin});
            documents.push(`${message.name}: ${message.content}`);
            id++;
        }
        ids.push(`id${id}`);
        metadata.push({name: outgoing.name, timestamp: outgoing.timestamp, origin: origin});
        documents.push(`${outgoing.name}: ${outgoing.content}`);

        await collection.add(
            {
                ids: ids,
                metadata: metadata,
                documents: documents
            }
        )
    }
}