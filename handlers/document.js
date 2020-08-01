var axios = require('axios');
var vscode;
var copypastas;

module.exports.initalize = async (vscodeLoad) => {
    vscode = vscodeLoad;
    let response = await axios.get('http://www.reddit.com/r/copypasta/new.json?sort=new');
    copypastas = response.data.data.children.map(x => x.data.selftext);
    console.log(copypastas)
    console.log(copypastas)
}

module.exports.destroy = () => {
    
}

var insertChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

module.exports.handlers = {
    "delete-random": () => {
        if (!vscode.window.activeTextEditor) return;
    
        let line = Math.floor(Math.random() * vscode.window.activeTextEditor.document.lineCount);
        let char = Math.floor(Math.random() * (vscode.window.activeTextEditor.document.lineAt(line).text.length - 1));
        let edit = new vscode.WorkspaceEdit();
        edit.delete(vscode.window.activeTextEditor.document.uri, {
            start: new vscode.Position(line, char),
            end : new vscode.Position(line, char + 1),
            isEmpty: false,
            isSingleLine: true
        })
        vscode.workspace.applyEdit(edit);
    },
    "insert-random": () => {
        if (!vscode.window.activeTextEditor) return;
    
        let line = Math.floor(Math.random() * vscode.window.activeTextEditor.document.lineCount);
        let char = Math.floor(Math.random() * (vscode.window.activeTextEditor.document.lineAt(line).text.length - 1));
        let edit = new vscode.WorkspaceEdit();
        edit.insert(vscode.window.activeTextEditor.document.uri, new vscode.Position(line, char), insertChars.charAt(Math.floor(Math.random() * insertChars.length)));
        vscode.workspace.applyEdit(edit);
    },
    "insert-random-copypasta": () => {
        if (!vscode.window.activeTextEditor) return;
    
        let line = Math.floor(Math.random() * vscode.window.activeTextEditor.document.lineCount);
        let char = Math.floor(Math.random() * (vscode.window.activeTextEditor.document.lineAt(line).text.length - 1));
        let edit = new vscode.WorkspaceEdit();
        edit.insert(vscode.window.activeTextEditor.document.uri, new vscode.Position(line, char), copypastas[Math.floor(Math.random() * copypastas.length)]);
        vscode.workspace.applyEdit(edit);
    },
    "replace-random": () => {
        if (!vscode.window.activeTextEditor) return;
    
        let line = Math.floor(Math.random() * vscode.window.activeTextEditor.document.lineCount);
        let char = Math.floor(Math.random() * (vscode.window.activeTextEditor.document.lineAt(line).text.length - 1));
        let edit = new vscode.WorkspaceEdit();
        edit.replace(vscode.window.activeTextEditor.document.uri, {
            start: new vscode.Position(line, char),
            end : new vscode.Position(line, char + 1),
            isEmpty: false,
            isSingleLine: true
        }, insertChars.charAt(Math.floor(Math.random() * insertChars.length)))
        vscode.workspace.applyEdit(edit);
    },
    "swap-random-characters": () => {
        if (!vscode.window.activeTextEditor) return;
    
        let line1 = Math.floor(Math.random() * vscode.window.activeTextEditor.document.lineCount);
        let line2 = Math.floor(Math.random() * vscode.window.activeTextEditor.document.lineCount);
        let line1Text = vscode.window.activeTextEditor.document.lineAt(line1).text;
        let line2Text = vscode.window.activeTextEditor.document.lineAt(line2).text;
        let line1Char = Math.floor(Math.random() * (line1Text.length - 1));
        let line2Char = Math.floor(Math.random() * (line2Text.length - 1));
        // vscode.window.activeTextEditor.document.lineAt(line).text.length - 2
        let edit = new vscode.WorkspaceEdit();
        edit.replace(vscode.window.activeTextEditor.document.uri, {
            start: new vscode.Position(line1, line1Char),
            end : new vscode.Position(line1, line1Char + 1),
            isEmpty: false,
            isSingleLine: true
        }, line2Text[line2Char]);
        edit.replace(vscode.window.activeTextEditor.document.uri, {
            start: new vscode.Position(line2, line2Char),
            end : new vscode.Position(line2, line2Char + 1),
            isEmpty: false,
            isSingleLine: true
        }, line1Text[line1Char]);
        vscode.workspace.applyEdit(edit);
    },
    "swap-random-lines": () => {
        if (!vscode.window.activeTextEditor) return;
    
        let line1 = Math.floor(Math.random() * vscode.window.activeTextEditor.document.lineCount);
        let line2 = Math.floor(Math.random() * vscode.window.activeTextEditor.document.lineCount);
        let line1Text = vscode.window.activeTextEditor.document.lineAt(line1).text;
        let line2Text = vscode.window.activeTextEditor.document.lineAt(line2).text;
        let edit = new vscode.WorkspaceEdit();
        edit.replace(vscode.window.activeTextEditor.document.uri, {
            start: new vscode.Position(line1, 0),
            end : new vscode.Position(line1, line1Text.length),
            isEmpty: false,
            isSingleLine: true
        }, line2Text);
        edit.replace(vscode.window.activeTextEditor.document.uri, {
            start: new vscode.Position(line2, 0),
            end : new vscode.Position(line2, line2Text.length),
            isEmpty: false,
            isSingleLine: true
        }, line1Text);
        vscode.workspace.applyEdit(edit);
    },
}

module.exports.info = {
    id: "document-handlers",
    name: "Document Handlers",
    version: "1.0",
    author: "FizzyApple12"
}