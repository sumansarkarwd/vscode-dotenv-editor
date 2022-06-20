import * as vscode from "vscode";
import {
  CommandAction,
  ICommand,
  IConfig,
  IEnvConfig,
  IEnvConfigFile,
} from "./app/model";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

export default class ViewLoader {
  private readonly _panel: vscode.WebviewPanel | undefined;
  private readonly _extensionPath: string;
  private _disposables: vscode.Disposable[] = [];

  constructor(fileUri: vscode.Uri, extensionPath: string) {
    this._extensionPath = extensionPath;

    let envConfig = this.getFileContent(fileUri);
    if (envConfig) {
      this._panel = vscode.window.createWebviewPanel(
        "configView",
        `Dotenv editor - ${fileUri.fsPath}`,
        vscode.ViewColumn.One,
        {
          enableScripts: true,

          localResourceRoots: [
            vscode.Uri.file(path.join(extensionPath, "configViewer")),
          ],
        }
      );

      this._panel.webview.html = this.getWebviewContent(envConfig);

      this._panel.webview.onDidReceiveMessage(
        (command: ICommand) => {
          switch (command.action) {
            case CommandAction.Save:
              this.saveFileContent(fileUri, command.content);
              return;
          }
        },
        undefined,
        this._disposables
      );
    }
  }

  private getWebviewContent(config: IEnvConfigFile): string {
    // Local path to main script run in the webview
    const reactAppPathOnDisk = vscode.Uri.file(
      path.join(this._extensionPath, "configViewer", "configViewer.js")
    );
    const reactAppUri = reactAppPathOnDisk.with({ scheme: "vscode-resource" });
    const configJson = JSON.stringify(config);

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Config View</title>
          <meta http-equiv="Content-Security-Policy"
                content="default-src 'none';
                        img-src https:;
                        script-src 'unsafe-eval' 'unsafe-inline' vscode-resource:;
                        style-src vscode-resource: 'unsafe-inline';">
          <script>
            window.acquireVsCodeApi = acquireVsCodeApi;
            window.initialData = ${configJson};
          </script>
      </head>
      <body>
          <div id="root"></div>
          <script src="${reactAppUri}"></script>
      </body>
      </html>
    `;
  }

  private getFileContent(fileUri: vscode.Uri): IEnvConfigFile | undefined {
    if (fs.existsSync(fileUri.fsPath)) {
      let content = fs.readFileSync(fileUri.fsPath, "utf8");

      const envConfig: IEnvConfigFile = {
        default: {
          name: "default",
          items: [],
          enabled: false,
        },
      };

      let currentBlock: string = "default";

      content.split(/\r?\n/).forEach((line) => {
        if (line.startsWith("# Block")) {
          const [key, value] = line.split("=");

          currentBlock = value;

          if (!envConfig[value]) {
            envConfig[value] = {
              name: value,
              items: [],
              enabled: false,
            };
          }
        } else {
          let envValLine: string;

          if (line.trim().length > 0) {
            let enabled = false;
            if (line.startsWith("#")) {
              envValLine = line.substring(1).trim();
            } else {
              envValLine = line;
              enabled = true;
            }

            const [key, value] = envValLine.split("=");
            envConfig[currentBlock].items.push({
              id: uuidv4(),
              name: key?.trim() || "",
              value: value ? value.trim() : "",
              enabled,
            });
          }
        }

        Object.keys(envConfig).forEach((key) => {
          envConfig[key].enabled = envConfig[key].items.some(
            (item) => item.enabled
          );
        });
      });

      if (!envConfig["default"].items.length) {
        if (Object.keys(envConfig).length) {
          // if default does not have any items and have other block then delete default block
          delete envConfig["default"];
        }
      }

      return envConfig;
    }
    return undefined;
  }

  private saveFileContent(fileUri: vscode.Uri, config: IEnvConfigFile) {
    console.log("config", config);

    let content = "";
    Object.keys(config).forEach((blockKey) => {
      const block = config[blockKey];
      content += `# Block=${block.name}\n\n`;
      block.items.forEach((item) => {
        if (item.enabled) {
          content += `${item.name}=${item.value}\n`;
        } else {
          content += `# ${item.name}=${item.value}\n`;
        }
      });
      content += "\n";
    });

    if (fs.existsSync(fileUri.fsPath)) {
      fs.writeFileSync(fileUri.fsPath, content);

      vscode.window.showInformationMessage(
        `👍 Configuration saved to ${fileUri.fsPath}`
      );
    }
  }
}
