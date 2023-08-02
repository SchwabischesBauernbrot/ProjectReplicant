const fs = require('fs');
const path = require('path');

// Folder that contains the JSON files
const inputFile = './log-output/bot-formatted-output.json';

// Where to save the simplified data
const outputFile = './log-output/bot-formatted-output.txt';

// Output string
let output = "";

let jsonData = fs.readFileSync(inputFile);

// Parse the JSON file
let jsonObject = JSON.parse(jsonData);

// The jsonObject is assumed to have a "messages" array
for (let message of jsonObject) {
  // Prepare the message text
  let messageText = `${message.name}: ${message.content}`;

  // If the message has attachments, append their URLs to the message text
  if (message.attachments && message.attachments.length > 0) {
    for (let attachment of message.attachments) {
      messageText += ` ${attachment.url}`;
    }
  }

  // Append the message text to the output string, followed by a newline
  output += messageText + '\n';
}

// Write the output string to a new text file
fs.writeFileSync(outputFile, output);
