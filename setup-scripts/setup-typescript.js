const terminal = require("../utils/terminal");
const Colors = require("../utils/terminalColors");
const dependencyInstaller = require("../utils/dependency-installer");
const fs = require("fs");
const path = require("path");

function removeComments(data) {
    let result = "";
    let commentOut = false;
    let commentOutLine = false;
    for (let index = 0; index < data.length; index++) {
        if (data.slice(index, index+2) == "/*") {
            commentOut = true;
        } else if (data.slice(index - 2, index) == "*/") {
            commentOut = false;
        }
        if (data.slice(index, index+2) == "//") commentOutLine = true;
        if (data[index] == "\n") commentOutLine = false;
        if (!commentOut && !commentOutLine) result += data[index];
    }
    return result;
}

exports.setupTypescript = async function (curDir, packageType) {
    console.log(Colors.FgGreen + Colors.Bright + `Installing typescript`);
    await dependencyInstaller.installDependency(curDir, "typescript");
    console.log(Colors.FgGreen + Colors.Bright + `Setting up typescript`);
    
    await terminal.executeInTerminal("./node_modules/.bin/tsc --init", curDir);

    // reading tsconfig and edit it
    let tsconfigData = fs.readFileSync(path.join(curDir, "tsconfig.json")).toString();
    tsconfigData = removeComments(tsconfigData);
    tsconfigData = JSON.parse(tsconfigData);
    
    tsconfigData.compilerOptions.rootDir = "./src";
    tsconfigData.compilerOptions.outDir = `./dist`;
    tsconfigData.compilerOptions.module = packageType == "server" ? "commonjs" : "esnext";

    tsconfigData.include = ["./src/**/*.ts"];
    tsconfigData.exclude = ["./node_modules", "./**/*.spec.ts"];

    tsconfigData.compilerOptions.strict = undefined;
    delete tsconfigData.compilerOptions.strict;

    fs.writeFileSync(path.join(curDir, "tsconfig.json"), JSON.stringify(tsconfigData, undefined, 2));
}   