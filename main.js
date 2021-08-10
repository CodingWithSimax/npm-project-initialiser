const fs = require("fs");
const path = require("path");
const process = require("process");

const terminal = require("./utils/terminal");
const terminalInput = require("./utils/terminalInput");
const setupScripts = require("./setup-scripts/setup-package");
const Colors = require("./utils/terminalColors");

const curPath = path.resolve(process.argv.length > 2 ? process.argv[2] : "./");


(async () => {
    const QUESTION_PREFIX = Colors.Reset + Colors.FgYellow;

    if (fs.readdirSync(curPath).length > 0) {
        console.log(Colors.FgRed + Colors.Bright + `Your folder '${curPath}' needs to be empty!`);
        const result = (await terminalInput.consoleInput(QUESTION_PREFIX + "Do you wanna clear it now?" + Colors.FgWhite, "yesNo")) == "yes";
        if (result) {
            for (const path2 of fs.readdirSync(curPath)) {
                await terminal.executeInTerminal(`rm -r ${path.join(curPath, path2)}`);
            }
        }
        await terminal.executeInTerminal(`node ${process.argv[1]} ./`, curPath, "");
        return;
    }
    console.log(Colors.FgGreen + Colors.Bright + `Setting up project...`);
    

    // asking all necessary questions

    const projectName = await terminalInput.consoleInput(QUESTION_PREFIX + "What name does your project have?" + Colors.FgWhite);
    const useEslint = (await terminalInput.consoleInput(QUESTION_PREFIX + "Would you like to use eslint? [yes, no]" + Colors.FgWhite, "yesNo")) == "yes";
    const usePrettier = (await terminalInput.consoleInput(QUESTION_PREFIX + "Would you like to use prettier? [yes, no]" + Colors.FgWhite, "yesNo")) == "yes";
    const useTypescript = (await terminalInput.consoleInput(QUESTION_PREFIX + "Would you like to use typescript? [yes, no]" + Colors.FgWhite, "yesNo")) == "yes";
    const useFrontend = (await terminalInput.consoleInput(QUESTION_PREFIX + "Does your project use Frontend? [yes, no]" + Colors.FgWhite, "yesNo")) == "yes";
    const useAngular = useFrontend && (await terminalInput.consoleInput(QUESTION_PREFIX + "Does your frontend-project use Angular?" + Colors.FgWhite, "yesNo")) == "yes";
    const useBackend = (await terminalInput.consoleInput(QUESTION_PREFIX + "Does your project use Backend? [yes, no]"+ Colors.FgWhite, "yesNo")) == "yes";

    if (useBackend && useFrontend) {
        fs.mkdirSync(path.join(curPath, "./web"));
        await setupScripts.setupPackage(path.join(curPath, "./web"), projectName + "-web", useEslint, usePrettier, useTypescript, useAngular, "web");
        fs.mkdirSync(path.join(curPath, "./server"));
        await setupScripts.setupPackage(path.join(curPath, "./server"), projectName + "-server", useEslint,usePrettier, useTypescript, useAngular, "server");
    } else if (useBackend || useFrontend) {
        await setupScripts.setupPackage(path.join(curPath, "./"), projectName, useEslint, usePrettier, useTypescript, useAngular, useBackend ? "server" : "web");
    } else {
        return;
    }
})();