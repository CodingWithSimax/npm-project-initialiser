const process = require("process");
const readline = require("readline");

function consoleInput(message="", resultType="any") {
    const rlInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(resolve => {
        rlInterface.question(message + " ", function (data) {
            data = data.split("\n")[0];
            rlInterface.close();
            if (resultType == "yesNo") {
                if (data != "yes" && data != "no") {
                    console.log("invalid input.")
                    consoleInput(message, resultType).then(resolve);
                    return;
                }
            }
            resolve(data);
        });
    });
}

exports.consoleInput = consoleInput;