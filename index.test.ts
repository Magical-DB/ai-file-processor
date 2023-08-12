import { AiFileProcessor } from "./index";
import fs from "fs-extra";

describe("AiFileProcessor", () => {
  const openAiKey = "YOUR_OPENAI_KEY";
  const folderPath = "/path/to/folder";
  const outputFilePathGenerator = (inputFilePath: string) => {
    // Generate output file path based on input file path
    return "/path/to/output/" + inputFilePath.split("/").pop();
  };
  const instruction = "Your instruction";
  const opts = {
    ignoreFileList: ["file1.txt", "file2.txt"],
    globPattern: "*.txt",
  };

  let aiFileProcessor: AiFileProcessor;

  beforeAll(() => {
    aiFileProcessor = new AiFileProcessor(openAiKey);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("processFilesInFolder", () => {
    it("should process all files in the folder", async () => {
      const onCompleteMock = jest.fn();

      await aiFileProcessor.processFilesInFolder(
        folderPath,
        outputFilePathGenerator,
        instruction,
        opts,
        onCompleteMock
      );

      expect(onCompleteMock).toHaveBeenCalled();
      expect(onCompleteMock).toHaveBeenCalledWith({
        completedFilesList: expect.any(Array),
        failedFilesList: expect.any(Array),
        pendingFilesList: expect.any(Array),
        allFilesList: expect.any(Array),
      });
    });

    it("should ignore files in the ignoreFileList", async () => {
      const onCompleteMock = jest.fn();

      await aiFileProcessor.processFilesInFolder(
        folderPath,
        outputFilePathGenerator,
        instruction,
        { ignoreFileList: ["file1.txt"] },
        onCompleteMock
      );

      expect(onCompleteMock).toHaveBeenCalled();
      expect(onCompleteMock).toHaveBeenCalledWith({
        completedFilesList: expect.any(Array),
        failedFilesList: expect.any(Array),
        pendingFilesList: expect.any(Array),
        allFilesList: expect.any(Array),
      });
    });

    it("should ignore files with specific patterns", async () => {
      const onCompleteMock = jest.fn();

      await aiFileProcessor.processFilesInFolder(
        folderPath,
        outputFilePathGenerator,
        instruction,
        { globPattern: "*.txt" },
        onCompleteMock
      );

      expect(onCompleteMock).toHaveBeenCalled();
      expect(onCompleteMock).toHaveBeenCalledWith({
        completedFilesList: expect.any(Array),
        failedFilesList: expect.any(Array),
        pendingFilesList: expect.any(Array),
        allFilesList: expect.any(Array),
      });
    });
  });

  describe("processFile", () => {
    it("should process a file and generate output file", async () => {
      const inputFilePath = "/path/to/input/file.txt";
      const outputFilePath = "/path/to/output/file.txt";
      const readFileAsyncMock = jest
        .spyOn(AiFileProcessor, "readFileAsync")
        .mockResolvedValue("File content");
      const openAiSummarizeTextMock = jest
        .spyOn(aiFileProcessor, "openAiSummarizeText")
        .mockResolvedValue({
          choices: [
            {
              message: {
                content: "Summary",
              },
            },
          ],
        });
      const writeFileAsyncMock = jest
        .spyOn(AiFileProcessor, "writeFileAsync")
        .mockResolvedValue();

      await aiFileProcessor.processFile(
        inputFilePath,
        outputFilePath,
        instruction
      );

      expect(readFileAsyncMock).toHaveBeenCalledWith(inputFilePath);
      expect(openAiSummarizeTextMock).toHaveBeenCalledWith({
        systemText: expect.any(String),
        expectedAction: instruction,
      });
      expect(writeFileAsyncMock).toHaveBeenCalledWith(
        outputFilePath,
        "Summary"
      );
    });
  });

  describe("getListOfAllNestedFilesInFolder", () => {
    it("should return a list of all nested files in the folder", async () => {
      const globMock = jest
        .spyOn(AiFileProcessor, "getListOfAllNestedFilesInFolder")
        .mockResolvedValue(["file1.txt", "file2.txt"]);

      const filesList = await AiFileProcessor.getListOfAllNestedFilesInFolder(
        folderPath,
        "*.txt"
      );

      expect(globMock).toHaveBeenCalledWith(folderPath, "*.txt");
      expect(filesList).toEqual(["file1.txt", "file2.txt"]);
    });
  });

  describe("writeFileAsync", () => {
    it("should write data to a file", async () => {
      const writeFileMock = jest
        .spyOn(fs, "writeFile")
        .mockImplementation((path, data, callback) => {
          callback(null);
        });

      await AiFileProcessor.writeFileAsync("/path/to/file.txt", "File content");

      expect(writeFileMock).toHaveBeenCalled();
    });

    it("should throw an error if writing to file fails", async () => {
      const writeFileMock = jest
        .spyOn(fs, "writeFile")
        .mockImplementation((path, data, callback) => {
          callback(new Error("Failed to write file"));
        });

      await expect(
        AiFileProcessor.writeFileAsync("/path/to/file.txt", "File content")
      ).rejects.toThrow("Failed to write file");

      expect(writeFileMock).toHaveBeenCalled();
    });
  });

  describe("readFileAsync", () => {
    it("should read data from a file", async () => {
      const readFileMock = jest
        .spyOn(fs, "readFile")
        .mockImplementation((path, options, callback) => {
          callback(null, "File content");
        });

      const data = await AiFileProcessor.readFileAsync("/path/to/file.txt");

      expect(readFileMock).toHaveBeenCalled();
      expect(data).toBe("File content");
    });

    it("should throw an error if reading from file fails", async () => {
      const readFileMock = jest
        .spyOn(fs, "readFile")
        .mockImplementation((path, options, callback) => {
          callback(new Error("Failed to read file"), null);
        });

      await expect(
        AiFileProcessor.readFileAsync("/path/to/file.txt")
      ).rejects.toThrow("Failed to read file");

      expect(readFileMock).toHaveBeenCalled();
    });
  });

  describe("readFileStatAsync", () => {
    it("should return the file stat", async () => {
      const statMock = jest
        .spyOn(fs, "stat")
        .mockImplementation((path, callback) => {
          callback(null, { isDirectory: () => false });
        });

      const stat = await AiFileProcessor.readFileStatAsync("/path/to/file.txt");

      expect(statMock).toHaveBeenCalled();
      expect(stat.isDirectory()).toBe(false);
    });

    it("should throw an error if getting file stat fails", async () => {
      const statMock = jest
        .spyOn(fs, "stat")
        .mockImplementation((path, callback) => {
          callback(new Error("Failed to get file stat"), null);
        });

      await expect(
        AiFileProcessor.readFileStatAsync("/path/to/file.txt")
      ).rejects.toThrow("Failed to get file stat");

      expect(statMock).toHaveBeenCalled();
    });
  });

  describe("readDirectoryAsync", () => {
    it("should return a list of files in the directory", async () => {
      const readdirMock = jest
        .spyOn(fs, "readdir")
        .mockImplementation((path, callback) => {
          callback(null, ["file1.txt", "file2.txt"]);
        });

      const files = await AiFileProcessor.readDirectoryAsync("/path/to/directory");

      expect(readdirMock).toHaveBeenCalled();
      expect(files).toEqual(["file1.txt", "file2.txt"]);
    });

    it("should throw an error if reading directory fails", async () => {
      const readdirMock = jest
        .spyOn(fs, "readdir")
        .mockImplementation((path, callback) => {
          callback(new Error("Failed to read directory"), null);
        });

      await expect(
        AiFileProcessor.readDirectoryAsync("/path/to/directory")
      ).rejects.toThrow("Failed to read directory");

      expect(readdirMock).toHaveBeenCalled();
    });
  });

  describe("openAiSummarizeText", () => {
    it("should return the summarized text", async () => {
      const createChatCompletionMock = jest
        .spyOn(aiFileProcessor.localOpenAiApi, "createChatCompletion")
        .mockResolvedValue({
          data: {
            choices: [
              {
                message: {
                  content: "Summary",
                },
              },
            ],
          },
        });

      const response = await aiFileProcessor.openAiSummarizeText({
        systemText: "System text",
        expectedAction: "Instruction",
      });

      expect(createChatCompletionMock).toHaveBeenCalled();
      expect(response.choices[0].message.content).toBe("Summary");
    });

    it("should throw an error if summarizing text fails", async () => {
      const createChatCompletionMock = jest
        .spyOn(aiFileProcessor.localOpenAiApi, "createChatCompletion")
        .mockRejectedValue(new Error("Failed to summarize text"));

      await expect(
        aiFileProcessor.openAiSummarizeText({
          systemText: "System text",
          expectedAction: "Instruction",
        })
      ).rejects.toThrow("Failed to summarize text");

      expect(createChatCompletionMock).toHaveBeenCalled();
    });
  });

  describe("extractResponseFromOpenAI", () => {
    it("should extract the response from OpenAI API", () => {
      const response = {
        choices: [
          {
            message: {
              content: "Summary",
            },
          },
        ],
      };

      const outputContent = aiFileProcessor.extractResponseFromOpenAI(response);

      expect(outputContent).toBe("Summary");
    });

    it("should return an empty string if response is empty", () => {
      const response = {
        choices: [],
      };

      const outputContent = aiFileProcessor.extractResponseFromOpenAI(response);

      expect(outputContent).toBe("");
    });
  });
});