const fs = require('fs');
require('dotenv').config()

let botName = process.env.SUBJECT_NAME;

const inputFile = './combined-output/formatted-output.json';
const outputFile = './combined-output/lora-training-output.json';

let output = [];

let jsonData = fs.readFileSync(inputFile);
let jsonObject = JSON.parse(jsonData);

let combinedMessages = [];
let previousName = null;
let combinedText = '';
let userCounter = 0;
let userMap = new Map(); // to keep track of unique users

for (let message of jsonObject) {
  if ((!message.content || message.content.trim() === '') && (!message.attachments || message.attachments.length === 0)) {
    continue;
  }

  let name = message.name;

  if (message.name !== botName && !userMap.has(name)) {
    userMap.set(name, ++userCounter);
  }

  name = message.name === botName ? '<BOT>' : `<USER${userMap.get(name) || ''}>`;

  let messageText = `${name}: ${message.content || ''}`;

  if (message.attachments && message.attachments.length > 0) {
    for (let attachment of message.attachments) {
      messageText += ` ${attachment.url}`;
    }
  }

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

if (previousName) {
  combinedMessages.push({ name: previousName, content: combinedText });
}

for (let i = 0; i < combinedMessages.length - 1; i++) {
  if (combinedMessages[i].name.startsWith('<USER') && combinedMessages[i+1].name === '<BOT>') {
    output.push({ input: combinedMessages[i].content, output: combinedMessages[i+1].content });
  }
}

fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));