const vscode = require('vscode');

exports.ScripterNodeProvider = class ScripterNodeProvider {
	changeTreeDataEvent = new vscode.EventEmitter();
	onDidChangeTreeData = this.changeTreeDataEvent.event;

	constructor() {

	}

	refresh() {
		this.changeTreeDataEvent.fire();
	}

	getTreeItem(element) {
        return element;
	}

	getChildren(element) {
        if (element) {;
            return Promise.resolve(element.parentScript.generateScriptEditor());
        }
		let scriptNodes = [];

		for (let script of this.scripts) {
            scriptNodes.push(script.generateScriptNode());
        };

        return Promise.resolve(scriptNodes);
    }

    update(scripter) {
        this.scripts = scripter.scripts;
        vscode.workspace.getConfiguration('codeShaker', 1).update('scripts', this.scripts, 1)
		this.changeTreeDataEvent.fire();
    }
}

exports.Scripter = class Scripter {
	constructor(events, handlers, scripts) {
        this.events = events;
        this.handlers = handlers;
        this.scripts = scripts;
    }
    
    addScript(event, args, handler) {
        this.scripts.push(new exports.Script(event, args, handler));
    }
    
    deleteScript(id) {
        let indexToDelete = 0;
        let that = this;
        for (let i = 0; i < this.scripts.length; i++) {
            if (that.scripts[i].id == id) indexToDelete = i;
        }
        this.scripts.splice(indexToDelete, 1);
    }
}

exports.ScriptNode = class ScriptNode extends vscode.TreeItem {
	constructor(parentScript) {
        super(parentScript.generateScriptText(), vscode.TreeItemCollapsibleState.Collapsed);
        this.parentScript = parentScript;
	}

    tooltip() {
		return parentScript.generateScriptText();
	}

	description() {
		return "";
    }

	contextValue = 'script';
}

exports.EditorNode = class EditorNode extends vscode.TreeItem {
	constructor(parentScript, type) {
        super(parentScript.generateScriptEditorTypes(type)[0], vscode.TreeItemCollapsibleState.None);
        this.parentScript = parentScript;
        this.type = type;
    }

    tooltip() {
		return parentScript.generateScriptEditorTypes(this.type)[1];
	}

	description() {
        return "";
    }

	contextValue = 'value';
}

exports.Script = class Script {
	constructor(event, args, handler) {
        this.event = event;
        this.args = args;
        this.handler = handler;
        this.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	}
    
    generateScriptText() {
        return `WHEN ${this.event} WITH ARGS [${this.args}] TRIGGERS THEN RUN ${this.handler}`;
    }
    
    generateScriptEditor() {
        return [
            new exports.EditorNode(this, 0), 
            new exports.EditorNode(this, 1), 
            new exports.EditorNode(this, 2)
        ];
    }

    generateScriptEditorTypes(type) {
        switch (type) {
            case 0:
                return [`Event: ${this.event}`, "Change the Event"];
            case 1:
                return [`Args: [${this.args}]`, "Edit the Argumnts"];
            case 2:
                return [`Handler: ${this.handler}`, "Change the Handler"];
        }
    }
    
    generateScriptNode() {
        return new exports.ScriptNode(this);
    }
}