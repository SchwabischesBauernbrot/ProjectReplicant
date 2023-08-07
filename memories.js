const {ChromaClient, OpenAIEmbeddingFunction} = require('chromadb');
const fs = require('fs');

require('dotenv').config()

let botName = process.env.SUBJECT_NAME;
const dbClient = new ChromaClient();

const embedder = new OpenAIEmbeddingFunction({openai_api_key: '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'})
let collection;
const inputFile = './combined-output/formatted-output.json';

let jsonData = fs.readFileSync(inputFile);
let jsonObject = JSON.parse(jsonData);

async function main(){
    await dbClient.deleteCollection({name: 'memories'});
    collection = await dbClient.createCollection({name: 'memories', embeddingFunction: embedder});
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
    let id = 0;
    for (let interaction of interactions) {
        let incoming = interaction.incoming;
        let outgoing = interaction.outgoing;
        let origin = interaction.origin;
        let ids = [];
        let metadata = [];
        let documents = [];
        let documentStrings = '';
        
        for(let message of incoming) {
            let content = message.content;
            if (message.attachments && Array.isArray(message.attachments) && message.attachments.length > 0) {
                for (let attachment of message.attachments) {
                    if (attachment.url) {
                        content += ' ' + attachment.url;
                    }
                }
            }
            documentStrings += `${message.name}: ${content}` + '\n';
        }

        if (outgoing.attachments && Array.isArray(outgoing.attachments) && outgoing.attachments.length > 0) {
            for (let attachment of outgoing.attachments) {
                if (attachment.url) {
                    outgoing.content += ' ' + attachment.url;
                }
            }
        }
        documentStrings += `${outgoing.name}: ${outgoing.content}`;

        ids.push(`id` + id);
        metadata.push({origin: origin});
        documents.push(documentStrings);
        id++;

        await collection.add(
            {
                ids: ids,
                metadata: metadata,
                documents: documents
            }
        )
    }
}