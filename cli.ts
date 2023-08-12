import { AiFileProcessor } from ".";
import path from "path";
import fs from "fs-extra";

import { Command } from "commander";
const program = new Command();

const processFromCommandLine = async () => {
  program
    .name("string-util")
    .description(
      "CLI to process the content of a folder using OpenAI API and write the output in another file"
    )
    .option("-k, --key <key>", "OpenAI API key")
    .option("-if, --inputFolder <inputFolder>", "Path to the folder to process")
    .option("-i, --instruction <instruction>", "Instruction text")
    .option(
      "-gp, --globPattern <globPattern>",
      "Optional glob pattern for filtering file names e.g *.txt"
    )
    .parse(process.argv);

  const options = program.opts();
  const openAiKey = options.key;
  const inputFolder = options.inputFolder;
  const globPattern = options.globPattern;

  const instruction = options.instruction;

  if (!openAiKey || !inputFolder) {
    console.error("API key and folder path are required.");
    return;
  }

  const outputDir = path.join(inputFolder, `ai_output_${Date.now()}`);
  fs.ensureDirSync(outputDir);
  const outputFileGenerator = (inputFilePath: string) =>
    path.join(outputDir, path.basename(inputFilePath));

  const fileProcessor = new AiFileProcessor(openAiKey);
  await fileProcessor.processFilesInFolder(
    inputFolder,
    outputFileGenerator,
    instruction,
    { ignoreFileList: [], globPattern: globPattern },
    async (opts) => {
      console.log("Processing completed:", opts);
    }
  );
};

processFromCommandLine();
