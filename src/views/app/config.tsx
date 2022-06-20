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

    if (newEnabled) {
      // disable all other blocks
      Object.keys(newState).forEach((blockKey) => {
        if (blockKey !== key) {
          newState[blockKey].enabled = false;
          // disable all items of block
          newState[blockKey].items.forEach((item) => {
            item.enabled = false;
          });
        }
      });
    }
    
    updateState(newState);
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

    const shouldMakeBlockActive = newState[blockKey].items.some(
      (item) => item.enabled
    );

    if (shouldMakeBlockActive) {
      newState[blockKey].enabled = true;

      // disable all other blocks
      Object.keys(newState).forEach((bk) => {
        if (bk !== blockKey) {
          newState[bk].enabled = false;
          // disable all items of block
          newState[bk].items.forEach((item) => {
            item.enabled = false;
          });
        }
      });
    }

    updateState(newState);
  };

  const onChangeItem = (blockKey, id, key, e) => {
    const newState = { ...state };
    newState[blockKey].items = newState[blockKey].items.map((item) => {
      if (item.id === id) {
        item[key] = e.target.value;
      }
      return item;
    });

    updateState(newState);
  };

  const updateState = newState => {
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
          <VSCodeTextField
            value={item.name}
            placeholder={`Enter key name`}
            onChange={(e) => onChangeItem(blockKey, item.id, "name", e)}
          />
          <VSCodeTextField
            value={item.value}
            placeholder={`Enter ${item.name}`}
            onChange={(e) => onChangeItem(blockKey, item.id, "value", e)}
          />
        </div>
      );
    });
  };

  return (
    <div className="App">
      <div className="top-btn-container">
        <VSCodeButton onClick={saveConfig}>Save</VSCodeButton>
      </div>

      <VSCodeDivider />

      {renderBlocks(state)}
    </div>
  );
};
export default ReactFCComponent;
