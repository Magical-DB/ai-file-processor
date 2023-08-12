"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiFileProcessor = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const openai_1 = require("openai");
class AiFileProcessor {
    constructor(openAiKey) {
        this.openAiKey = openAiKey;
        const configuration = new openai_1.Configuration({
            apiKey: this.openAiKey,
        });
        this.localOpenAiApi = new openai_1.OpenAIApi(configuration);
    }
    /**
     *
     * @param folderPath  path to the folder to process
     * @param outputFileGenerator return the output file path for a given input file path.
     */
    processFilesInFolder(folderPath, outputFilePathGenerator, instruction, onComplete) {
        return __awaiter(this, void 0, void 0, function* () {
            const completedFilesList = [];
            const failedFilesList = [];
            const allFilesList = yield AiFileProcessor.getListOfAllNestedFilesInFolder(folderPath);
            const pendingFilesList = [...allFilesList];
            for (let i = 0; i < pendingFilesList.length; i++) {
                const filePath = pendingFilesList[i];
                try {
                    if (completedFilesList.includes(filePath)) {
                        console.log("File path already completed", filePath);
                    }
                    else if (failedFilesList.includes(filePath)) {
                        console.log("File path failed", filePath);
                    }
                    else {
                        console.log("Processing", filePath);
                        const outputFilePathName = outputFilePathGenerator(filePath);
                        yield this.processFile(filePath, outputFilePathName, instruction);
                        completedFilesList.push(filePath);
                        pendingFilesList.splice(i, 1);
                    }
                }
                catch (err) {
                    console.log("Error occured for file", filePath, err === null || err === void 0 ? void 0 : err.message);
                    failedFilesList.push(filePath);
                }
            }
            yield onComplete({
                completedFilesList,
                failedFilesList,
                pendingFilesList,
                allFilesList,
            });
        });
    }
    processFile(inputFilePath, outputFileLocation, instruction) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Processing file: " + inputFilePath);
            const fileContent = yield AiFileProcessor.readFileAsync(inputFilePath);
            const response = yield this.openAiSummarizeText({
                systemText: `Here is a file content: ${fileContent} with path ${inputFilePath}}`,
                expectedAction: `${instruction || "No instruction provided"}}`,
            });
            const outputContent = yield this.extractResponseFromOpenAI(response);
            yield AiFileProcessor.writeFileAsync(outputFileLocation, outputContent);
            console.log("Completed");
            return;
        });
    }
    static getListOfAllNestedFilesInFolder(folderPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const filesList = [];
            const files = yield this.readDirectoryAsync(folderPath);
            for (const file of files) {
                console.log("running for: ", file);
                const filePath = path_1.default.join(folderPath, file);
                const stat = yield this.readFileStatAsync(filePath);
                if (stat.isDirectory()) {
                    yield this.getListOfAllNestedFilesInFolder(filePath);
                }
                else {
                    filesList.push(filePath);
                }
            }
            return filesList;
        });
    }
    static writeFileAsync(outputFileUrl, data) {
        return new Promise((resolve, reject) => {
            fs_1.default.writeFile(outputFileUrl, data, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }
    static readFileAsync(inputFileUrl) {
        return new Promise((resolve, reject) => {
            fs_1.default.readFile(inputFileUrl, "utf8", (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }
    static readFileStatAsync(fileUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fs_1.default.stat(fileUrl, (err, stat) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(stat);
                });
            });
        });
    }
    static readDirectoryAsync(directoryUrl) {
        return new Promise((resolve, reject) => {
            fs_1.default.readdir(directoryUrl, (err, files) => {
                if (err) {
                    reject(err);
                }
                resolve(files);
            });
        });
    }
    openAiSummarizeText(opts) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            console.log("[summarizeText] started", opts);
            const systemMessage = {
                role: "system",
                content: opts.systemText,
            };
            const userMessage = {
                role: "user",
                content: opts.expectedAction,
            };
            const messages = (_a = [systemMessage, userMessage]) === null || _a === void 0 ? void 0 : _a.map((mes) => {
                return Object.assign(Object.assign({}, mes), { content: mes.content });
            });
            const model = "gpt-3.5-turbo";
            try {
                const response = yield this.localOpenAiApi.createChatCompletion({
                    model: model,
                    messages: messages,
                    // max_tokens: max_tokens,
                });
                console.log("[summarizeText] Response", (_b = response === null || response === void 0 ? void 0 : response.data) === null || _b === void 0 ? void 0 : _b.choices);
                console.log("[summarizeText] ended", opts);
                return response === null || response === void 0 ? void 0 : response.data;
            }
            catch (err) {
                console.log("[summarizeText] Error", err === null || err === void 0 ? void 0 : err.message, err);
                throw err;
            }
        });
    }
    extractResponseFromOpenAI(response) {
        var _a;
        return ((_a = response === null || response === void 0 ? void 0 : response.choices[0].message) === null || _a === void 0 ? void 0 : _a.content) || "";
    }
}
exports.AiFileProcessor = AiFileProcessor;
//# sourceMappingURL=index%20copy.js.map