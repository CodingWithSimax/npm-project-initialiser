const Colors = require("../utils/terminalColors");
const terminal = require("../utils/terminal");
const dependencyInstaller = require("../utils/dependency-installer");
const setupScripts = require("./index");
const fs = require("fs");
const path = require("path");

exports.setupPackage = async function (curDir, projectName, useEslint, usePrettier, useTypescript, useAngular, packageType) {

    // setting up projects package.json
    console.log(Colors.FgGreen + Colors.Bright + `Creating package.json...`);
    console.log(Colors.FgGreen + Colors.Bright + `saving package.json for first time...`);
    const packageConfiguration = {
        "name": projectName,
        "version": "1.0.0",
        "main": "main.js",
        "scripts": {
        },
        "keywords": [],
        "author": "",
        "license": "ISC",
        "description": ""
      };      
    fs.writeFileSync(path.join(curDir, "package.json"), JSON.stringify(packageConfiguration, undefined, 2));

    if (useAngular && packageType == "web") {
        await dependencyInstaller.installDependency(curDir, "@angular/cli");
        fs.unlinkSync(path.join(curDir, "package.json"));
        await terminal.executeInTerminal(`./node_modules/.bin/ng new ${projectName} --directory . --skip-git`, curDir);
        const angularConfig = JSON.parse(fs.readFileSync(path.join(curDir, "angular.json")).toString());
        angularConfig.projects[projectName].architect.build.options.outputPath = `./dist`;
        fs.writeFileSync(path.join(curDir, "angular.json"), JSON.stringify(angularConfig, undefined, 2));
    }

    // setting up eslint
    if (useEslint) {
        await setupScripts.setupEslint(useTypescript, curDir);
        packageConfiguration.scripts.check = `./node_modules/.bin/eslint './src/**/*.{ts,js}'`;
    }
    if (usePrettier) {
        await setupScripts.setupPrettier(curDir);
        packageConfiguration.scripts.precheck = `./node_modules/.bin/prettier --tab-width 4 --write './**/*.{json,${useTypescript?"ts":"js"}}'`
    }

    if (useEslint || usePrettier) packageConfiguration.scripts.prebuild = `npm run check`;

    // setting up typescript
    if (useTypescript && !(useAngular && packageType == "web")) {
        await setupScripts.setupTypescript(curDir, packageType);
        packageConfiguration.scripts.build = `./node_modules/.bin/tsc`;
    }

    if (useTypescript || useEslint || usePrettier || (useAngular && packageType == "web")) packageConfiguration.scripts.prestart = `npm run build`;
    if (packageType == "server") packageConfiguration.scripts.start = `node main.js`;

    if (!(useAngular && packageType == "web")) {
        if (!fs.existsSync(path.join(curDir, "./src")))
            fs.mkdirSync(path.join(curDir, "./src"));
        console.log(Colors.FgGreen + Colors.Bright + `Creating default files`);
        let pathSrc = undefined;
        if (packageType == "web" && !useAngular) {
            pathSrc = path.join(__dirname, "../defaults/web" + (useTypescript ? "ts" : "js"));
        } else if (packageType == "server") {
            pathSrc = path.join(__dirname, "../defaults/server" + (useTypescript ? "ts" : "js"));
        }
        terminal.copyFolder(pathSrc, path.join(curDir, "./src"));
    }
    terminal.mapFiles(path.join(curDir, "./src"), (content) => 
        content
            .split("%projectName%").join(projectName)
    );

    // save
    console.log(Colors.FgGreen + Colors.Bright + `saving package.json...`);
    const newPackageConfiguration = JSON.parse(fs.readFileSync(path.join(curDir, "package.json")).toString());
    newPackageConfiguration.name = packageConfiguration.name;
    for (const key of Object.keys(packageConfiguration.scripts)) newPackageConfiguration.scripts[key] = packageConfiguration.scripts[key];
    fs.writeFileSync(path.join(curDir, "package.json"), JSON.stringify(newPackageConfiguration, undefined, 2));

    // executing first build
    if (useTypescript || useEslint || usePrettier) {
        console.log(Colors.FgGreen + Colors.Bright + `executing first build...`);
        await terminal.executeInTerminal("npm run build", curDir);
    }
}