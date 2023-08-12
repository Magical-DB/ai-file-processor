# AI-file-processor

## Script for automating file processing using ai
NOTE: Using OpenAI cost money so be careful of using this on very large folders with nested subfolders.

This is a module for automatically performing actions on a lot of files in a folder and generating an output folder 

#### For example:
You want to convert a repository to typescript
OR automatically write test scripts for all the files in a folder <br>
OR generate a summary for all the files in a folder <br>
OR Basically any bulk action that needs to be performed on a list of files (and subfiles) in a folder in which a corresponding output files needs to be generated for each of the files in the folders 

##### Note:
It supports filtering files using glob patterns e.g to filter only txt files pass "*.txt". By default any file with node_modules in the path is fiiltered out



### Using command line (CLI)
Make sure nodejs is installed

```
npx @magicaldb/ai-file-processor processFile -k "OPEN_AI_API_KEY" -gp "*.txt" -if ./example-data/  -i "Answer the question in the file provided"
```

```
"-k, --key <key>", "OpenAI API key"

"-if, --inputFolder <inputFolder>", "Path to the folder to process"

"-i, --instruction <instruction>", "Instruction text"

"-gp, --globPattern <globPattern>",
      "Optional glob pattern for filtering file names e.g *.txt"
```
Note:
When the CLI is used, the output files will be in a subfolder to the input folder `ai_output_<Date>` e.g `<input folder path>/ai_output_1691837703331/...`


### Using npm module

```
processFilesInFolder(
  folderPath: string,
  outputFilePathGenerator: (inputFilePath: string) => string,
  instruction: string,
  opts: { ignoreFileList?: string[]; fileRegex?: RegExp },
  onComplete: (opts: {
      completedFilesList: string[];
      failedFilesList: string[];
      pendingFilesList: string[];
      allFilesList: string[];
  }) => Promise<void>
)
```
e.g 
```
import { AiFileProcessor } from "ai-file-processor";

const fileProcessor = new AiFileProcessor(openAiKey);
await fileProcessor.processFilesInFolder(
    inputFolder,
    outputFileGenerator,
    instruction,
    {
      ignoreFileList:["node_modules", ".gitignore"],
      globPattern: "*.tx"
    }
    async (opts) => {
      console.log("Processing completed:", opts);
    }
  );
```



