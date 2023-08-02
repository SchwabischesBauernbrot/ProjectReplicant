const fs = require('fs');
const path = require('path');

// Folder that contains the JSON files
const inputFile = './combined-output/formatted-output.json';

// Where to save the simplified data
const outputFile = './combined-output/lora-raw-output.txt';

// Output string
let output = "";

// Read the JSON file
let jsonData = fs.readFileSync(inputFile);

// Parse the JSON file
let jsonObject = JSON.parse(jsonData);

// The jsonObject is assumed to have a "messages" array
for (let message of jsonObject) {
  // If the message content is empty and there are no attachments, skip this message
  if ((!message.content || message.content.trim() === '') && (!message.attachments || message.attachments.length === 0)) {
    continue;
  }

  let name = message.name;
  if(message.name !== '_thesentinel') name = '<USER>';
  if(message.name === '_thesentinel') name = '<BOT>';
  let messageText = `${name}: ${message.content || ''}`;

  // If the message has attachments, append their URLs to the message text
  if (message.attachments && message.attachments.length > 0) {
    for (let attachment of message.attachments) {
      messageText += ` ${attachment.url}`;
    }
  }

  // Append the message text to the output string, followed by a newline
  // Skip appending if the messageText is blank
  if (messageText.trim() !== '') {
    output += messageText + '\n';
  }
}

// Remove empty lines from the output
output = output.split('\n').filter(line => line.trim() !== '').join('\n');

// Write the output string to a new text file
fs.writeFileSync(outputFile, output);