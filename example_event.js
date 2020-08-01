var vscode; // Store the vscode api globaly since you are only given it once

// Runs when the module is loaded and gives you the vscode api to interact with the editor
module.exports.initalize = (vscodeLoad) => {
    vscode = vscodeLoad;
}

// Runs when the extension is deactivated
module.exports.destroy = () => {
    
}

module.exports.events = {
    "example-event": { // The name given in here will appear in the event scriptor, periods will be filtered out
        trigger: (args) => { // Run as fast as possible to check if the event needs to be fired, arg contians the data given to the event in the scriptor
            return false; // Must return a boolean otherwise the event will never fire
        }, 
        args: [ // Define the args you want to take in
            [ "number", "A cool number" ] // can be "number", "boolean", or "string"
        ]
    }
}

module.exports.info = {
    id: "example-events", // The id of the event module, periods will be filtered out
    name: "Example Events", // The name of the event module
    version: "1.0", // The version of the event module
    author: "FizzyApple12" // The author of the event module
}