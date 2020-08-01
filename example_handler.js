var vscode; // Store the vscode api globaly since you are only given it once

// Runs when the module is loaded and gives you the vscode api to interact with the editor
module.exports.initalize = (vscodeLoad) => {
    vscode = vscodeLoad;
}

// Runs when the extension is deactivated
module.exports.destroy = () => {
    
}

module.exports.handlers = {
    "example-handler": () => { // The name given in here will appear in the event scriptor, periods will be filtered out. run when an event containing this handler is triggered
            
    },
}

module.exports.info = {
    id: "example-handlers", // The id of the handler module, periods will be filtered out
    name: "Example Handlers", // The name of the handler module
    version: "1.0", // The version of the handler module
    author: "FizzyApple12" // The author of the handler module
}