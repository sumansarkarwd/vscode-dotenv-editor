// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import ViewLoader from "./views/viewLoader";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "dotenv-editor-ts.openEditor",
    (args) => {
      const filePath = args.fsPath;
      vscode.window.showInformationMessage(`Opening ${filePath}`);
      const view = new ViewLoader(args, context.extensionPath);
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
