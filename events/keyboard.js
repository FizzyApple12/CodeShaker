var vscode;
var approxKeysTyped = 0;
var previousApproxKeysTyped = 0;

module.exports.initalize = (vscodeLoad) => {
    vscode = vscodeLoad;
    vscode.workspace.onDidChangeTextDocument(changes => {
        approxKeysTyped += changes.contentChanges.length;
    })
}

module.exports.destroy = () => {
    
}

var minkpsTimer = 0;
var maxkpsTimer = 0;

module.exports.events = {
    "keys-typed": {
        trigger: (args) => {
            if (approxKeysTyped % args[0] == 0) return true;
            return false;
        }, 
        args: [
            [ "number", "The number of keys between triggers" ]
        ]
    },
    "keys-per-second-min": {
        trigger: (args) => {
            minkpsTimer++
            if (minkpsTimer < 1000) return
            minkpsTimer = 0;
            let difference = approxKeysTyped - previousApproxKeysTyped;
            previousApproxKeysTyped = approxKeysTyped;
            if (difference < args[0]) return true
            return false;
        }, 
        args: [
            [ "number", "The minimum number of keys per second allowed" ]
        ]
    },
    "keys-per-second-max": {
        trigger: (args) => {
            maxkpsTimer++
            if (maxkpsTimer < 1000) return
            maxkpsTimer = 0;
            let difference = approxKeysTyped - previousApproxKeysTyped;
            previousApproxKeysTyped = approxKeysTyped;
            if (difference > args[0]) return true
            return false;
        }, 
        args: [
            [ "number", "The maximum number of keys per second allowed" ]
        ]
    },
}

module.exports.info = {
    id: "keyboard-events",
    name: "Keyboard Events",
    version: "1.0",
    author: "FizzyApple12"
}