# AI-file-processor
### Perform bulk actions on a all nested files in a folder using natural language.

 Currently only supports text based files like `txt`, `programming language scripting files`, `csv`  etc.
 Support for media files, images, videos and their instruction coming soon

## Script for processing files in a folder using ai
This is a library for automatically performing actions on a lot of files in a folder and generating an output folder 

NOTE: Using OpenAI cost money so be careful of using this on very large folders with nested subfolders.

### Installation:
Run `npm install -g @magicaldb/ai-file-processor`  to install the library and then you can use `ai-file-processor --help`  
OR 
Use `npx @magicaldb/ai-file-processor` directly to use the library directly without installation.
RUN `npx @magicaldb/ai-file-processor --help` to see arguments

You need to have nodejs installed.

#### Usage:
You want to convert all js files in a repository from javascript to typescript
#### Example 1 
##### With installation:
```
ai-file-processor -k "OPEN_AI_KEY" -if "code-repository/"  -gp "*.js"  -i "convert the content of the file to typescript. Make sure you maintain the same functionality, signature and method names. Dont change anything that doesnt have tio change. All functionalities must be the same. Return only the typescript code and nothing else"
```
OR
##### Without installation:
```
npx @magicaldb/ai-file-processor -k "OPEN_AI_KEY" -if "code-repository/"  -gp "*.js"  -i "convert the content of the file to typescript. Make sure you maintain the same functionality, signature and method names. Dont change anything that doesnt have tio change. All functionalities must be the same. Return only the typescript code and nothing else"
```

<br>

#### Example 2 Without installation:
Automatically write test scripts for all the files in a folder 
```
npx @magicaldb/ai-file-processor -k "OPEN_AI_KEY" -if "code-repository/"  -gp "*.js"  -i "Write comprehensive and complete unit test with jest for the content of the file. Make sure you capture all the edge cases and complete the test yourself, Only return the test code and nothing else"
```

#### Example 3 Without installation:
Generate a summary for all the files in a folder
```
npx @magicaldb/ai-file-processor -k "OPEN_AI_KEY" -if "folder/"  -gp "*.txt"  -i "Summarise the content of the files ..."
```


<br>
Basically any bulk action that needs to be performed on a list of files (and subfiles) in a folder in which a corresponding output files needs to be generated for each of the files in the folders 

##### Note:
It supports filtering files using glob patterns e.g to filter only txt files pass "*.txt". By default any file with node_modules and in the path is fiiltered out



### Using command line (CLI)
Make sure nodejs is installed

```
npx @magicaldb/ai-file-processor -k "OPEN_AI_API_KEY" -gp "*.txt" -if ./example-data/  -i "Answer the question in the file provided" -ig "node_modules,package-lock.json"
```

```
"-k, --key <key>", "OpenAI API key"

"-if, --inputFolder <inputFolder>", "Path to the folder to process"

"-i, --instruction <instruction>", "Instruction text"

"-gp, --globPattern <globPattern>",
      "Optional glob pattern for filtering file names e.g *.txt"

"-ig, --ignoreList <ignorelist>", "Optional Files to ignore seperated by ,. The ignore list has to match the absolute path of the file. Use glob pattern for a more flexible option"
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



