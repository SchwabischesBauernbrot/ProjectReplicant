const fs = require('fs');
require('dotenv').config()

let botName = process.env.SUBJECT_NAME;

const inputFile = './combined-output/formatted-output.json';

// Where to save the simplified data
const outputFile = './combined-output/lora-training-output.json';

// Output array
let output = [];

let jsonData = fs.readFileSync(inputFile);

// Parse the JSON file
let jsonObject = JSON.parse(jsonData);

// The jsonObject is assumed to have a "messages" array
let combinedMessages = [];
let previousName = null;
let combinedText = '';

for (let message of jsonObject) {
  // If the message content is empty and there are no attachments, skip this message
  if ((!message.content || message.content.trim() === '') && (!message.attachments || message.attachments.length === 0)) {
    continue;
  }

  let name = message.name;
  if(message.name !== botName) name = '<USER>';
  if(message.name === botName) name = '<BOT>';
  let messageText = `${name}: ${message.content || ''}`;

  // If the message has attachments, append their URLs to the message text
  if (message.attachments && message.attachments.length > 0) {
    for (let attachment of message.attachments) {
      messageText += ` ${attachment.url}`;
    }
  }

  // Combine messages from the same sender
  if (name === previousName) {
    combinedText += '\n' + messageText;
  } else {
    if (previousName) {
      combinedMessages.push({ name: previousName, content: combinedText });
    }
    combinedText = messageText;
    previousName = name;
  }
}
// Don't forget to add the last combined message
if (previousName) {
  combinedMessages.push({ name: previousName, content: combinedText });
}

// Now pair up messages between the user and the bot
for (let i = 0; i < combinedMessages.length - 1; i++) {
  if (combinedMessages[i].name === '<USER>' && combinedMessages[i+1].name === '<BOT>') {
    output.push({ input: combinedMessages[i].content, output: combinedMessages[i+1].content });
  }
}

// Write the output array to a new JSON file
fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
