const terminal = require("./terminal");
const Colors = require("./terminalColors");

exports.installDependency = async function (curPath, ...dependencies) {
    for (const dependency of dependencies) {
        console.log(Colors.Reset + Colors.FgMagenta + "Installing dependency " + Colors.BgWhite + Colors.FgBlack + dependency)
        await terminal.executeInTerminal(`npm install ${dependency}`, curPath);
    }
};