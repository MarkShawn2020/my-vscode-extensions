// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { log } from 'console';
import path = require('path');
import { escape } from 'querystring';
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "markdown-nodes" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('markdown-nodes.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user


        let wsEdit = new vscode.WorkspaceEdit();
        // ref: https://stackoverflow.com/a/46340496/9422455
        let editor = vscode.window.activeTextEditor;
        if (!editor) { return; }

        let doc = editor.document;
        let filePath = doc.fileName;
        let fileName = path.basename(filePath);
        console.log("doc uri: " + doc.uri + ", fileName: " + doc.fileName);

        const selection = editor.selection;
        const selectedText = doc.getText(selection);
        let toWriteText: string = "";
        if (!selectedText) { return; }

        let isCoding: boolean = false;
        let titleLine: string = "";
        let title: string = "";
        let levelToLevelUp: number = 0;
        for (let line of selectedText.split("\n")) {
            // console.log("line: " + line);

            if (/^```/.test(line)) {
                isCoding = !isCoding;
            }
            if (!isCoding) {
                let reg = /^(#+) (.*?)$/;
                // ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match
                let matched = line.match(reg);
                if (matched) {
                    if (!title) {
                        titleLine = line;
                        levelToLevelUp = matched[1].length - 1;
                        title = matched[2];
                        toWriteText += "from: [" + fileName + "](" + escape(fileName) +  ")\n---\n\n";
                    }
                    line = matched[1].substring(0, matched[1].length - levelToLevelUp) + " " + matched[2];
                }
            }
            toWriteText += line + "\n";
        }

        // ref: https://stackoverflow.com/a/60787824/9422455, https://stackoverflow.com/a/423385/9422455
        let newDocFileName = title + ".md";
        let newDocFilePath = path.join(path.dirname(doc.uri.fsPath), newDocFileName);
        let newDocUri = vscode.Uri.file(newDocFilePath);
        // ref: https://stackoverflow.com/questions/53073926/how-do-i-create-a-file-for-a-visual-studio-code-extension
        wsEdit.createFile(newDocUri);
        wsEdit.insert(newDocUri, new vscode.Position(0, 0), toWriteText);
        wsEdit.replace(doc.uri, selection, titleLine + "\n\nsee: [" + title + "](" + escape(newDocFileName) + ")\n");
        vscode.workspace.applyEdit(wsEdit);
        vscode.window.showInformationMessage('Created a new file: ' + newDocFilePath);
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
