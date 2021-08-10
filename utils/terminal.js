const {exec, spawn} = require("child_process");
const path = require("path");
const fs = require("fs");
const process = require("process");
const Colors = require("./terminalColors");

exports.executeInTerminal = function (data, workingPath="./", prefix=(Colors.Reset + Colors.Dim)) {
    const newPath = path.resolve(workingPath);
    console.log(Colors.Reset + Colors.FgBlue + `Executing '${data}' in path '${newPath}'`);
    return new Promise(resolve => {
        /*
        exec(`cd ${newPath} && sudo ` + data, function (error, stdout, stderr) {
            if (error) {
              throw new Error(error.stack + "\nError code: " + error.code + '\nSignal received: '+error.signal);
            }
            resolve(stdout);
          });*/
        let result = "";
        const child = spawn(`cd ${newPath} && sudo ` + data, {shell: true});
        process.stdin.pipe(child.stdin);
        child.stderr.on('data', function (data) {
            process.stdout.write(prefix + data.toString() + Colors.Reset);
          });
          child.stdout.on('data', function (data) {
            process.stdout.write(prefix + data + Colors.Reset);
            result += data;
          });
          child.on('exit', function (exitCode) {
            resolve(result);
          });
          
    });
}

function getFilesRecursively(workingPath, startPath="") {
    let resFiles = [];
    for (const paths of fs.readdirSync(path.join(startPath, workingPath))) {
        const statSync = fs.statSync(path.join(startPath, workingPath, paths));
        if (statSync.isFile()) {
            resFiles.push(path.join(workingPath, paths));
        } else {
            resFiles = resFiles.concat(getFilesRecursively(path.join(workingPath, paths), startPath)); 
        }
    }
    return resFiles;
}

exports.getFilesRecursively = getFilesRecursively; 

function genenerateFolders(destPath) {
    const paths = destPath.split("/");
    for (let index = 2; index < paths.length; index++) {
        const curPath = paths.slice(0, index).join("/");
        if (!fs.existsSync(curPath))
            fs.mkdirSync(curPath);
    }
}

exports.genenerateFolders = genenerateFolders;


exports.copyFolder = function (srcFolder, destFolder) {
    const files = getFilesRecursively("./", srcFolder);
    let index = 0;
    for (const file of files) {
        genenerateFolders(path.join(destFolder, file, "../"));
        const srcPath = path.join(srcFolder, file);
        const destPath = path.join(destFolder, file);
        console.log(Colors.FgYellow + Math.round(index / files.length * 1000) / 10 + "% ('" + srcPath + "' -> '" + destPath + "')" + Colors.Reset);
        fs.copyFileSync(srcPath, destPath);
        index++;
    }
}

exports.mapFiles = function (folderPath, callback) {
    const files = getFilesRecursively("./", folderPath);
    let index = 0;
    files.forEach((file) => {
        const completePath = path.join(folderPath, file);
        console.log(Colors.FgYellow + Math.round(index / files.length * 1000) / 10 + "% (changing '" + completePath + "')" + Colors.Reset);
        fs.writeFileSync(completePath, callback(fs.readFileSync(completePath).toString()));
        index++;
    });
}