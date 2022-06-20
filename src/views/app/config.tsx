/* eslint-disable @typescript-eslint/naming-convention */
import * as React from "react";
import { ICommand, CommandAction, IEnvConfigFile } from "./model";
import {
  VSCodeCheckbox,
  VSCodeTextField,
  VSCodeButton,
  VSCodeDivider,
} from "@vscode/webview-ui-toolkit/react";

interface IConfigProps {
  vscode: any;
  initialData: IEnvConfigFile;
}

const ReactFCComponent: React.FC<IConfigProps> = (props) => {
  const [state, setState] = React.useState<IEnvConfigFile>(props.initialData);

  const saveConfig = () => {
    let command: ICommand = {
      action: CommandAction.Save,
      content: state,
    };
    props.vscode.postMessage(command);
  };

  const onChangeBlockEnabledState = (key) => {
    const newState = { ...state };
    const newEnabled = !newState[key].enabled;

    // disabled all items of block
    newState[key].items.forEach((item) => {
      item.enabled = newEnabled;
    });
    newState[key].enabled = newEnabled;

    setState(newState);
    props.vscode.setState(newState);
  };

  const renderBlocks = (config) => {
    return Object.keys(config).map((key) => {
      return (
        <div key={key}>
          <VSCodeCheckbox
            checked={config[key].enabled}
            id={key}
            value={key}
            onClick={() => onChangeBlockEnabledState(key)}
          >
            <h2>{key}</h2>
          </VSCodeCheckbox>

          <div className="block-container">
            {renderItems(config[key].items, key)}
          </div>
        </div>
      );
    });
  };

  const onChangeItemEnabledState = (blockKey, id) => {
    const newState = { ...state };
    newState[blockKey].items = newState[blockKey].items.map((item) => {
      if (item.id === id) {
        item.enabled = !item.enabled;
      }
      return item;
    });
    setState(newState);
    props.vscode.setState(newState);
  };

  const renderItems = (items, blockKey) => {
    return items.map((item) => {
      return (
        <div key={item.id} className="block-item-container">
          <VSCodeCheckbox
            id={item.id}
            checked={item.enabled}
            value={item.id}
            onClick={() => onChangeItemEnabledState(blockKey, item.id)}
          />
          <VSCodeTextField value={item.name} placeholder={`Enter key name`} />
          <VSCodeTextField
            value={item.value}
            placeholder={`Enter ${item.name}`}
          >
            <span slot="end" className="codicon codicon-text-size"></span>
          </VSCodeTextField>
        </div>
      );
    });
  };

  return (
    <div className="App">
      <div className="top-btn-container">
        <VSCodeButton onClick={saveConfig}>
          Save
        </VSCodeButton>
      </div>

      <VSCodeDivider />

      {renderBlocks(state)}
    </div>
  );
};
export default ReactFCComponent;
