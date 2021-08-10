const fs = require("fs");
const path = require("path");
const dependencyInstaller = require("../utils/dependency-installer");
const Colors = require("../utils/terminalColors");

exports.setupEslint = async function (useTypescript, curDir) {
    console.log(Colors.FgGreen + Colors.Bright + `Installing eslint`);
    await dependencyInstaller.installDependency("eslint");
    console.log(Colors.FgGreen + Colors.Bright + `Setting up eslint`);
    const eslintConfiguration = {
        "env": {
            "browser": true,
            "es2021": true,
            "node": true
        },
        "extends": [
            "eslint:recommended"
        ],
        "parserOptions": {
            "ecmaVersion": 12,
            "sourceType": "module"
        },
        "plugins": [
        ],
        "rules": {
        }
    };

    await dependencyInstaller.installDependency(curDir, "eslint@latest");

    if (useTypescript) {
        eslintConfiguration.extends.push("plugin:@typescript-eslint/recommended");
        eslintConfiguration.plugins.push("@typescript-eslint");
        eslintConfiguration.parser = "@typescript-eslint/parser";
        await dependencyInstaller.installDependency(curDir, "@typescript-eslint/eslint-plugin@latest", "@typescript-eslint/parser@latest");
    }

    // save configuration
    console.log(Colors.Reset + Colors.FgGreen + Colors.Bright + `saving eslint configuration...`);
    fs.writeFileSync(path.join(curDir, "./.eslintrc.json"), JSON.stringify(eslintConfiguration, undefined, 2));
}