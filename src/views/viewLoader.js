"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class ViewLoader {
    constructor(fileUri) {
        this._panel = vscode.window.createWebviewPanel("configView", "Config View", vscode.ViewColumn.One, {});
        this._panel.webview.html = this.getWebviewContent(fileUri.fsPath);
    }
    getWebviewContent(filepath) {
        return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Config View</title>
    </head>
    <body>
        <img src="https://media.giphy.com/media/uoAn5ik8zAuqI/giphy.gif" width="300" /><br/>
        <code>${filepath}</code>
    </body>
    </html>`;
    }
}
exports.default = ViewLoader;
//# sourceMappingURL=viewLoader.js.map