const fs = require("fs");
const path = require("path");
const dependencyInstaller = require("../utils/dependency-installer");
const Colors = require("../utils/terminalColors");

exports.setupPrettier = async function (curDir) {
    console.log(Colors.FgGreen + Colors.Bright + `Installing prettier`);
    await dependencyInstaller.installDependency(curDir, "prettier");
    console.log(Colors.FgGreen + Colors.Bright + `Setting up prettier`);

    const prettierIgnore = [
        "/node_modules",
        "/tsconfig.json",
        "/package.json",
        "/package-lock.json",
        "/.eslintrc.json"
    ];
    fs.writeFileSync(path.join(curDir, "./.prettierignore"), prettierIgnore.join("\n"));
}