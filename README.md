# ProjectReplicant
 Using Discord Logs to get data for LoRA and VectorDB
# How do I use this to get LoRA Data?
I'm going to tell you how to scrape logs, and then how to use my scripts. The rest is up to you.
## Step One
https://github.com/Tyrrrz/DiscordChatExporter
Download that, follow the instructions in the repo to get it set up.
## Step Two
Select private DMs or server chats you want to scrape for logs. This is meant to be used on yourself, so. 
Export them to JSON and format the markdown. 
## Step Three
Put the logs into combined-input folder.
## Step Four
Go to the .env.txt and remove the extension .txt, saving it as a .env file.
Inside this new file, change the subject name to your discord username
## Step Five
Run the lora-logs.bat
It will ask you to press space after each script is run, do so.
## Done!
Check the combined-output folder for your files.

# How do I use this to get Vector Memory data?
Repeat Step one above, get to step two but inside of the export section of the ChatExporter add in filter
the filter will be:
```
filter:yoursubjectname
```
Do not use spaces!
Then export.
## Step Three
Put the logs into log-input folder.
## Step Four
same as above.
## Step Five
Run the solo-memories.bat
It will ask you to press space after each script is run, do so.
## Done!
Check the log-output folder for the subject's messages. 
