const fs = require('fs');
const path = require('path');

// Folder that contains the JSON files
const inputFolder = './log-input/';

// Where to save the simplified JSON
const outputFile = './log-output/bot-formatted-output.json';

// Get list of files in the input folder
const files = fs.readdirSync(inputFolder);

// Output array
let output = [];

// Loop through the files
for (let file of files) {
  // Check if the file is a JSON file
  if (path.extname(file) === '.json') {
    // Read the JSON file
    let jsonData = fs.readFileSync(path.join(inputFolder, file));

    // Parse the JSON file
    let jsonObject = JSON.parse(jsonData);

    // The jsonObject is assumed to have a "messages" array
    for (let message of jsonObject.messages) {
      // Simplify the format
      let simplifiedObject = {
        'timestamp': message.timestamp,
        'name': message.author.name,
        'content': message.content,
        'attachments': message.attachments,
        'origin': jsonObject.channel.id
      };

      // Add the simplified object to the output array
      output.push(simplifiedObject);
    }
  }
}

// Write the output array to a new JSON file
fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));