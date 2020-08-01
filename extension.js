const vscode = require('vscode');
const { ScripterNodeProvider, Scripter, Script } = require('./scripter');
const fs = require('fs');

var active = false;

var events = [];
var eventParents = {};
var handlers = [];
var handlerParents = {};
var scripts = vscode.workspace.getConfiguration('codeShaker', 1).get('scripts');

for (var i = 0; i < scripts.length; i++) {
	scripts[i] = new Script(scripts[i].event, scripts[i].args, scripts[i].handler);
}

const scripter = new Scripter(events, handlers, scripts);
const scripterNodeProvider = new ScripterNodeProvider();
const baseDir = __dirname;

fs.readdir(`${baseDir}/events`, (err, fls) => {
	if (err) return

	let loaded = fls.filter(file => file.split('.').pop() == 'js');

	if (loaded.length < 1) return vscode.window.showInformationMessage('Code Shaker did not find any script events!');

	for (let name of loaded) {
		try {
			let eventParent = require(`${baseDir}/events/${name}`);
			eventParent.initalize(vscode);
			eventParent.info.id = eventParent.info.id.replace(/\./g, '');
			for (let eventName in eventParent.events) {
				eventParent.events[eventName.replace(/\./g, '')] = eventParent.events[eventName];
				events.push(`${eventParent.info.id}.${eventName.replace(/\./g, '')}`);
			}
			eventParents[eventParent.info.id] = eventParent;
		} catch (e) { }
	};
	vscode.window.showInformationMessage(`Code Shaker loaded ${events.length} script event(s)!`)
});

fs.readdir(`${baseDir}/handlers`, (err, fls) => {
	if (err) return

	let commands = fls.filter(file => file.split('.').pop() == 'js');

	if (commands.length < 1) return vscode.window.showInformationMessage('Code Shaker did not find any script handlers!');

	for (let name of commands) {
		try {
			let handlerParent = require(`${baseDir}/handlers/${name}`);
			handlerParent.initalize(vscode);
			handlerParent.info.id = handlerParent.info.id.replace(/\./g, '');
			for (let eventName in handlerParent.handlers) {
				handlerParent.handlers[eventName.replace(/\./g, '')] = handlerParent.handlers[eventName];
				handlers.push(`${handlerParent.info.id}.${eventName.replace(/\./g, '')}`);
			}
			handlerParents[handlerParent.info.id] = handlerParent;
		} catch (e) { }
	};
	vscode.window.showInformationMessage(`Code Shaker loaded ${handlers.length} script handler(s)!`)
});

var eventInterval = setInterval(() => {
	if (!active) return
	for (let script of scripter.scripts) {
		let event = stringToEvent(script.event)
		let handler = stringToHandler(script.handler)

		let result = event.trigger(script.args);
		if (typeof result === "boolean" && result) handler();
	}
}, 1);

const activate = (context) => {
	statusBarActivator = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	statusBarActivator.command = 'codeShaker.activateInWindow';
	statusBarActivator.text = `Activate Code Shaker`;
	context.subscriptions.push(statusBarActivator);
	statusBarActivator.show();

	context.subscriptions.push(vscode.commands.registerCommand('codeShaker.activateInWindow', () => {
		if (active) return vscode.window.showInformationMessage('Code Shaker is already active.');
		vscode.window.showInformationMessage('Activated Code Shaker in the current workspace!');
		active = true;
		statusBarActivator.command = 'codeShaker.deactivateInWindow';
		statusBarActivator.text = `Dectivate Code Shaker`;
		statusBarActivator.show();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('codeShaker.deactivateInWindow', () => {
		if (!active) return vscode.window.showInformationMessage('Code Shaker is already inactive.');
		vscode.window.showInformationMessage('Deactivated Code Shaker in the current workspace!');
		active = false;
		statusBarActivator.command = 'codeShaker.activateInWindow';
		statusBarActivator.text = `Activate Code Shaker`;
		statusBarActivator.show();
	}));


	context.subscriptions.push(vscode.commands.registerCommand('codeShakerScripter.addScript', () => {
		vscode.window.showQuickPick(events, {
			ignoreFocusOut: true,
			placeHolder: 'Event',
			prompt: 'Select an Event'
		}).then(eventIn => {
			if (eventIn) vscode.window.showInputBox({
				ignoreFocusOut: true,
				placeHolder: 'Args',
				prompt: 'Set the Event Args (Separated by Commas)',
				validateInput: (value) => {
					return checkArgsValid(eventIn, value)
				}
			}).then(argsIn => {
				if (argsIn) vscode.window.showQuickPick(handlers, {
					ignoreFocusOut: true,
					placeHolder: 'Event',
					prompt: 'Select an Event'
				}).then(handlerIn => {
					if (handlerIn) {
						scripter.addScript(eventIn, convertArrayTypes(csvToArray(argsIn), stringToEvent(eventIn).args), handlerIn)
						scripterNodeProvider.update(scripter);
					}
				});
			});
		});
	}));

	context.subscriptions.push(vscode.commands.registerCommand('codeShakerScripter.deleteScript', node => {
		scripter.deleteScript(node.parentScript.id)
		scripterNodeProvider.update(scripter);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('codeShakerScripter.editValue', node => {
		switch (node.type) {
			case 0:
				vscode.window.showQuickPick(events, {
					ignoreFocusOut: true,
					placeHolder: 'Event',
					prompt: 'Select an Event'
				}).then(value => {
					if (value) node.parentScript.event = value;
					scripterNodeProvider.update(scripter);
				});
				break;
			case 1:
				vscode.window.showInputBox({
					ignoreFocusOut: true,
					placeHolder: 'Args',
					prompt: 'Set the Event Args (Separated by Commas)',
					validateInput: (value) => {
						return checkArgsValid(node.parentScript.event, value)
					}
				}).then(value => {
					if (value) node.parentScript.args = convertArrayTypes(csvToArray(value), stringToEvent(node.parentScript.event).args);
					scripterNodeProvider.update(scripter);
				});
				break;
			case 2:
				vscode.window.showQuickPick(handlers, {
					ignoreFocusOut: true,
					placeHolder: 'Event',
					prompt: 'Select an Event'
				}).then(value => {
					if (value) node.parentScript.handler = value;
					scripterNodeProvider.update(scripter);
				});
				break
		}
	}));

	vscode.window.registerTreeDataProvider('scripterView', scripterNodeProvider);
	scripterNodeProvider.update(scripter);
}

const deactivate = () => {
	for (let handlerParent in handlerParents) {
		handlerParent.destroy();
	}
}

const checkArgsValid = (eventName, input) => {
	let event = stringToEvent(eventName);
	let inputArgs = csvToArray(input);

	if (inputArgs.length > event.args.length) return `Too many arguments.`
	if (inputArgs.length < event.args.length) return `Args[${inputArgs.length-1}] (${event.args[inputArgs.length-1][1]}): ${event.args[inputArgs.length-1][0]}`;
	
	for (var i = 0; i < event.args.length; i++) {
		let invalid = false
		if (event.args[i][0] == 'number' && isNaN(inputArgs[i])) invalid = true;
		if (event.args[i][0] == 'boolean' && inputArgs[i] != 'true' && inputArgs[i] != 'false') invalid = true;
		if (event.args[i][0] == 'string') invalid = false;
		if (invalid) return `Args[${i}] (${event.args[i][1]}) must be a ${event.args[i][0]}`;
	}

	return null;
}

const csvToArray = (csv) => {
	let builtArray = [""];
	let arrayPointer = 0;

	try {
		for (var char of csv) {
			if (char == ',') {
				arrayPointer++;
				builtArray[arrayPointer] = "";
				continue; 
			}
			builtArray[arrayPointer] += char;
		}
	} catch (e) {}

	return builtArray;
}

const convertArrayTypes = (array, args) => {
	let builtArray = [];

	for (var i = 0; i < args.length; i++) {
		if (args[i][0] == 'number') builtArray.push(Number(array[i]))
		if (args[i][0] == 'boolean' && array[i] == 'true') builtArray.push(true)
		if (args[i][0] == 'boolean' && array[i] == 'false') builtArray.push(false)
		if (args[i][0] == 'string') builtArray.push(array[i])
	}

	return builtArray;
}

const stringToEvent = (string) => {
	return eventParents[string.split('.')[0]].events[string.split('.')[1]];
}

const stringToHandler = (string) => {
	return handlerParents[string.split('.')[0]].handlers[string.split('.')[1]];
}

module.exports = {
	activate,
	deactivate
}