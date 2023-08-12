# ai-file-processor

## Script for automating file processing using ai


### CLI Options: 
```


"-k, --key <key>", "OpenAI API key"

"-if, --inputFolder <inputFolder>", "Path to the folder to process"

"-i, --instruction <instruction>", "Instruction text"
```

```
ts-node cli.ts -k "OPEN_AI_API_KEY" -if ./example-data/  -i "Answer the question in the file provided"
```


### Code Options:

```
import { AiFileProcessor } from "ai-file-processor";

const fileProcessor = new AiFileProcessor(openAiKey);
await fileProcessor.processFilesInFolder(
    inputFolder,
    outputFileGenerator,
    instruction,
    async (opts) => {
      console.log("Processing completed:", opts);
    }
  );
```

type of opts

```
folderPath: string,
outputFilePathGenerator: (inputFilePath: string) => string,
instruction: string,
onComplete: (opts: {
    completedFilesList: string[];
    failedFilesList: string[];
    pendingFilesList: string[];
    allFilesList: string[];
}) => Promise<void>
```