import * as React from "react";
import * as ReactDOM from "react-dom";

import "./index.css";
import { IEnvConfigFile } from "./model";
import Config from "./config";

declare global {
  interface Window {
    acquireVsCodeApi(): any;
    initialData: IEnvConfigFile;
  }
}

const vscode = window.acquireVsCodeApi();

ReactDOM.render(
  <Config vscode={vscode} initialData={window.initialData} />,
  document.getElementById("root")
);