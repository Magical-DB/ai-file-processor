import path from "path";
import { Configuration, CreateChatCompletionResponse, OpenAIApi } from "openai";
import { glob } from "glob";
import fs from "fs-extra";

export class AiFileProcessor {
  private localOpenAiApi: OpenAIApi;
  public constructor(private openAiKey: string) {
    const configuration = new Configuration({
      apiKey: this.openAiKey,
    });
    this.localOpenAiApi = new OpenAIApi(configuration);
  }

  /**
   *
   * @param folderPath  path to the folder to process
   * @param outputFileGenerator return the output file path for a given input file path.
   */
  public async processFilesInFolder(
    folderPath: string,
    outputFilePathGenerator: (inputFilePath: string) => string,
    instruction: string,
    opts: { ignoreFileList?: string[]; globPattern?: string },
    onComplete: (opts: {
      completedFilesList: string[];
      failedFilesList: string[];
      pendingFilesList: string[];
      allFilesList: string[];
    }) => Promise<void>
  ) {
    const globPattern = opts?.globPattern;
    const ignoreFileList = [...(opts?.ignoreFileList || [])];
    const completedFilesList: string[] = [];
    const failedFilesList: string[] = [];
    const allFilesList: string[] =
      await AiFileProcessor.getListOfAllNestedFilesInFolder(
        folderPath,
        globPattern
      );

    const pendingFilesList = [...allFilesList].filter((filePath) => {
      if (
        ignoreFileList.includes(filePath) ||
        filePath.includes(".git") ||
        filePath.includes(".DS_Store") ||
        filePath.includes("node_modules") ||
        filePath.includes("package-lock.json") ||
        filePath.includes("package.json")
      ) {
        console.log("Ignore: ", filePath);

        return false;
      }
      return true;
    });

    console.log("Processing ", pendingFilesList.length, "files");

    console.log({ pendingFilesList, allFilesList });

    for (let i = 0; i < pendingFilesList.length; i++) {
      const filePath: string = pendingFilesList[i];
      try {
        if (completedFilesList.includes(filePath)) {
          console.log("File path already completed", filePath);
        } else if (failedFilesList.includes(filePath)) {
          console.log("File path failed", filePath);
        } else {
          const outputFilePathName = outputFilePathGenerator(filePath);
          await this.processFile(filePath, outputFilePathName, instruction);
          completedFilesList.push(filePath);
          pendingFilesList.splice(i, 1);
        }
      } catch (err: any) {
        console.log("Error occured for file", filePath, err, err?.message);
        failedFilesList.push(filePath);
      }
    }

    await onComplete({
      completedFilesList,
      failedFilesList,
      pendingFilesList,
      allFilesList,
    });

    console.log("Processing Completed ", {
      completedFilesList,
      failedFilesList,
      pendingFilesList,
      allFilesList,
    });
  }

  public async processFile(
    inputFilePath: string,
    outputFileLocation: string,
    instruction: string
  ): Promise<void> {
    console.log("Processing file: " + inputFilePath);
    const fileContent = await AiFileProcessor.readFileAsync(inputFilePath);
    const response = await this.openAiSummarizeText({
      systemText: `Here is a file with file path ${inputFilePath}. The result is going to be outputed to ${outputFileLocation}. The content of the file is: ${fileContent}`,
      expectedAction: `${instruction || "No instruction provided"}}`,
    });
    const outputContent = await this.extractResponseFromOpenAI(response);
    await AiFileProcessor.writeFileAsync(outputFileLocation, outputContent);
    console.log("Completed");
    return;
  }

  public static async getListOfAllNestedFilesInFolder(
    folderPath: string,
    globPattern?: string
  ): Promise<string[]> {
    const filesList: string[] = [];

    const options = {
      cwd: folderPath, // The current working directory in which to search
      dot: false, // Include hidden files
      nodir: true, // Do not include directories in the result
      absolute: true, // Return absolute paths
      ignore: ["node_modules/**"], // Ignore specific patterns
    };

    const pattern = globPattern || "**/*";

    const files = await glob(pattern, options);
    filesList.push(...files);
    return filesList;
  }

  // public static async getListOfAllNestedFilesInFolder(
  //   folderPath: string,
  //   regex?: RegExp
  // ): Promise<string[]> {
  //   const filesList: string[] = [];
  //   const files = await this.readDirectoryAsync(folderPath);
  //   for (const file of files) {
  //     const filePath = path.join(folderPath, file);
  //     const stat = await this.readFileStatAsync(filePath);
  //     if (stat.isDirectory()) {
  //       await this.getListOfAllNestedFilesInFolder(filePath);
  //     } else {
  //       if (!regex || (regex && regex.test(filePath))) {
  //         filesList.push(filePath);
  //       }
  //     }
  //   }

  //   return filesList;
  // }

  public static writeFileAsync(
    outputFileUrl: string,
    data: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.writeFile(outputFileUrl, data, (err: any) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  public static readFileAsync(inputFileUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(inputFileUrl, "utf8", (err: any, data: any) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
  }

  public static async readFileStatAsync(fileUrl: string): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.stat(fileUrl, (err: any, stat: any) => {
        if (err) {
          reject(err);
        }
        resolve(stat);
      });
    });
  }

  public static readDirectoryAsync(directoryUrl: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(directoryUrl, (err: any, files: string[]) => {
        if (err) {
          reject(err);
        }
        resolve(files);
      });
    });
  }

  private async openAiSummarizeText(opts: {
    systemText: string;
    expectedAction: string;
  }): Promise<CreateChatCompletionResponse> {
    console.log("[summarizeText] started", opts);
    const systemMessage = {
      role: "system" as "system",
      content: opts.systemText,
    };
    const userMessage = {
      role: "user" as "user",
      content: opts.expectedAction,
    };
    const messages = [systemMessage, userMessage]?.map((mes) => {
      return { ...mes, content: mes.content };
    });
    const model = "gpt-3.5-turbo";

    try {
      const response = await this.localOpenAiApi.createChatCompletion({
        model: model,
        messages: messages,
        temperature: 0,
        // max_tokens: max_tokens,
      });
      console.log("[summarizeText] Response", response?.data?.choices);
      console.log("[summarizeText] ended", opts);
      return response?.data;
    } catch (err: any) {
      console.log("[summarizeText] Error", err?.message, err);
      throw err;
    }
  }

  private extractResponseFromOpenAI(response: CreateChatCompletionResponse) {
    return response?.choices[0].message?.content || "";
  }
}
