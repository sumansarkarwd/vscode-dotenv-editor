// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import ViewLoader from "./views/viewLoader";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "dotenv-editor-ts.openEditor",
    () => {
      let openDialogOptions: vscode.OpenDialogOptions = {
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        filters: {
          Env: ["env"],
        },
        // open current workspace directory or user home directory
        defaultUri: vscode.workspace.workspaceFolders
          ? vscode.workspace.workspaceFolders[0].uri
          : vscode.Uri.file(process.env.HOME || "/"),
      };

      vscode.window
        .showOpenDialog(openDialogOptions)
        .then(async (uri: vscode.Uri[] | undefined) => {
          if (uri && uri.length > 0) {
            const filePath = uri[0].fsPath;
            vscode.window.showInformationMessage(`Opening ${filePath}`);
            const view = new ViewLoader(uri[0], context.extensionPath);
          } else {
            vscode.window.showErrorMessage("No valid file selected!");
            return;
          }
        });
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
