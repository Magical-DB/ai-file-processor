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
const _1 = require(".");
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const commander_1 = require("commander");
const program = new commander_1.Command();
const processFromCommandLine = () => __awaiter(void 0, void 0, void 0, function* () {
    program
        .name("string-util")
        .description("CLI to process the content of a folder using OpenAI API and write the output in another file")
        .option("-k, --key <key>", "OpenAI API key")
        .option("-if, --inputFolder <inputFolder>", "Path to the folder to process")
        .option("-i, --instruction <instruction>", "Instruction text")
        .parse(process.argv);
    const options = program.opts();
    const openAiKey = options.key;
    const inputFolder = options.inputFolder;
    const instruction = options.instruction;
    if (!openAiKey || !inputFolder) {
        console.error("API key and folder path are required.");
        return;
    }
    const outputDir = path_1.default.join(inputFolder, `ai_output_${Date.now()}`);
    fs_extra_1.default.ensureDirSync(outputDir);
    const outputFileGenerator = (inputFilePath) => path_1.default.join(outputDir, path_1.default.basename(inputFilePath));
    const fileProcessor = new _1.AiFileProcessor(openAiKey);
    yield fileProcessor.processFilesInFolder(inputFolder, outputFileGenerator, instruction, (opts) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Processing completed:", opts);
    }));
});
processFromCommandLine();
//# sourceMappingURL=cli.js.map