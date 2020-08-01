var vscode;

module.exports.initalize = (vscodeLoad) => {
    vscode = vscodeLoad;
}

module.exports.destroy = () => {
    
}

var timerTime = 0;

module.exports.events = {
    "timer": {
        trigger: (args) => {
            timerTime++;
            if (timerTime % args[0] == 0) return true;
            return false;
        }, 
        args: [
            [ "number", "Miliseconds to wait between triggers" ]
        ]
    }
}

module.exports.info = {
    id: "timer-events",
    name: "Timer Events",
    version: "1.0",
    author: "FizzyApple12"
}