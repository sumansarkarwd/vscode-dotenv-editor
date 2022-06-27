/* eslint-disable @typescript-eslint/naming-convention */
import * as React from "react";
import {
  ICommand,
  CommandAction,
  IEnvConfigFile,
  IEdtorActionStep,
  IEdtorAction,
} from "./model";
import {
  VSCodeCheckbox,
  VSCodeTextField,
  VSCodeButton,
  VSCodeDivider,
} from "@vscode/webview-ui-toolkit/react";
import { v4 as uuidv4 } from "uuid";

interface IConfigProps {
  vscode: any;
  initialData: IEnvConfigFile;
}

interface IActivityStack {
  position: number;
  steps: IEdtorActionStep[];
}

const ReactFCComponent: React.FC<IConfigProps> = (props) => {
  let initialData = props.initialData;

  let oldState = props.vscode.getState();
  if (oldState) {
    initialData = oldState;
  }

  const [state, setState] = React.useState<IEnvConfigFile>(initialData);
  const [showAddBlock, setShowAddBlock] = React.useState<boolean>(false);
  const [newBlockName, setNewBlockName] = React.useState<string>("");

  const [activityUndoStack, setActivityUndoStack] =
    React.useState<IActivityStack>({
      position: -1,
      steps: [],
    });
  const [activityRedoStack, setActivityRedoStack] =
    React.useState<IActivityStack>({
      position: -1,
      steps: [],
    });

  const addUndo = (step: IEdtorActionStep) => {
    const newActivityUndoStack = { ...activityUndoStack };
    const newActivityRedoStack = { ...activityRedoStack };

    newActivityUndoStack.steps = newActivityUndoStack.steps.slice(
      0,
      newActivityUndoStack.position + 1
    );
    newActivityUndoStack.steps.push(step);
    newActivityUndoStack.position = newActivityUndoStack.position + 1;
    setActivityUndoStack(newActivityUndoStack);

    newActivityRedoStack.position = -1;
    newActivityRedoStack.steps = [];
    setActivityRedoStack(newActivityRedoStack);
  };

  const addRedo = (step: IEdtorActionStep) => {
    const newActivityRedoStack = { ...activityRedoStack };
    newActivityRedoStack.steps = newActivityRedoStack.steps.slice(
      0,
      newActivityRedoStack.position + 1
    );
    newActivityRedoStack.steps.push(step);
    newActivityRedoStack.position = newActivityRedoStack.position + 1;
    setActivityRedoStack(newActivityRedoStack);
  };

  const undoActivity = () => {
    const newActivityUndoStack = { ...activityUndoStack };
    if (newActivityUndoStack.position !== -1) {
      const undoStep =
        newActivityUndoStack.steps[newActivityUndoStack.position];

      if (undoStep) {
        if (undoStep.action === IEdtorAction.DeleteItem) {
          const item = state[undoStep.data.blockName].items.find(
            (item) => item.id === undoStep.data.itemId
          );
          removeItemFromBlock(undoStep.data.blockName, undoStep.data.itemId);
          addRedo({
            action: IEdtorAction.AddItem,
            data: {
              blockName: undoStep.data.blockName,
              item,
            },
          });
        } else if (undoStep.action === IEdtorAction.AddItem) {
          addNewItemToBlock(undoStep.data.blockName, undoStep.data.item);
          addRedo({
            action: IEdtorAction.DeleteItem,
            data: {
              blockName: undoStep.data.blockName,
              item: undoStep.data.item,
              itemId: undoStep.data.item.id,
            },
          });
        }
      }
      newActivityUndoStack.position = newActivityUndoStack.position - 1;
      setActivityUndoStack(newActivityUndoStack);
    }
  };

  const redoActivity = () => {
    const newActivityRedoStack = { ...activityRedoStack };
    const newActivityUndoStack = { ...activityUndoStack };

    const redoStep = newActivityRedoStack.steps[newActivityRedoStack.position];

    if (redoStep) {
      if (redoStep.action === IEdtorAction.AddItem) {
        addNewItemToBlock(redoStep.data.blockName, redoStep.data.item);
      } else if (redoStep.action === IEdtorAction.DeleteItem) {
        removeItemFromBlock(redoStep.data.blockName, redoStep.data.itemId);
      }
    }
    newActivityRedoStack.steps.pop();
    newActivityRedoStack.position = newActivityRedoStack.position - 1;
    setActivityRedoStack(newActivityRedoStack);

    newActivityUndoStack.position = newActivityUndoStack.position + 1;
    setActivityUndoStack(newActivityUndoStack);
  };

  const updateState = (newState) => {
    setState(newState);
    props.vscode.setState(newState);
  };

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

  const onClickAddNewItemToBlock = (key) => {
    const newItemId = uuidv4();
    const newItem = {
      id: newItemId,
      enabled: false,
      name: "",
      value: "",
    };

    addUndo({
      action: IEdtorAction.DeleteItem,
      data: {
        blockName: key,
        itemId: newItemId,
      },
    });

    addNewItemToBlock(key, newItem);
  };

  const addNewItemToBlock = (key, item) => {
    const newState = { ...state };
    newState[key].items.push(item);
    updateState(newState);
  };

  const removeBlock = (key) => {
    const newState = { ...state };
    delete newState[key];
    updateState(newState);
  };

  const renderBlocks = (config) => {
    return Object.keys(config).map((key) => {
      return (
        <div key={key}>
          <div className="block-heading-container">
            <VSCodeCheckbox
              checked={config[key].enabled}
              id={key}
              value={key}
              onClick={() => onChangeBlockEnabledState(key)}
            >
              <h2>{key}</h2>
            </VSCodeCheckbox>
            <VSCodeButton
              title="Add item to block"
              onClick={() => onClickAddNewItemToBlock(key)}
            >
              +
            </VSCodeButton>
            <VSCodeButton
              title="Remove block"
              onClick={() => removeBlock(key)}
              appearance="secondary"
            >
              -
            </VSCodeButton>
          </div>

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

  const removeItemFromBlock = (blockKey, itemId) => {
    const newState = { ...state };

    let itemToRemove;

    newState[blockKey].items = newState[blockKey].items.filter((item) => {
      if (item.id === itemId) {
        itemToRemove = item;
      }
      return item.id !== itemId;
    });

    addUndo({
      action: IEdtorAction.AddItem,
      data: {
        blockName: blockKey,
        item: itemToRemove,
      },
    });

    updateState(newState);
  };

  const toggleShowAddBlock = (show: boolean) => {
    setShowAddBlock(show);
  };

  const handleSaveNewBlock = () => {
    const newState = { ...state };
    if (!newState[newBlockName]) {
      newState[newBlockName] = {
        name: newBlockName,
        items: [],
        enabled: false,
      };
    }
    updateState(newState);
    setNewBlockName("");
    toggleShowAddBlock(false);
  };

  const handleCancelNewBlockAdd = () => {
    setNewBlockName("");
    toggleShowAddBlock(false);
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
            placeholder={`Enter ${item.name || "value"}`}
            onChange={(e) => onChangeItem(blockKey, item.id, "value", e)}
          />
          <VSCodeButton
            title="Remove item"
            onClick={() => removeItemFromBlock(blockKey, item.id)}
          >
            -
          </VSCodeButton>
        </div>
      );
    });
  };

  return (
    <div className="App">
      <div className="top-btn-container">
        {activityUndoStack.steps.length > 0 && activityUndoStack.position > -1 ? (
          <VSCodeButton onClick={undoActivity}>Undo</VSCodeButton>
        ) : null}
        {activityRedoStack.steps.length &&
        activityRedoStack.position <= activityRedoStack.steps.length - 1 ? (
          <VSCodeButton onClick={redoActivity}>Redo</VSCodeButton>
        ) : null}
        <VSCodeButton
          appearance="secondary"
          onClick={() => toggleShowAddBlock(true)}
        >
          + Block
        </VSCodeButton>
        <VSCodeButton onClick={saveConfig}>Save</VSCodeButton>
      </div>
      {showAddBlock && (
        <div className="add-new-block-container">
          <div>
            <VSCodeTextField
              value={newBlockName}
              placeholder="Enter block name"
              onChange={(e) => setNewBlockName(e.target.value)}
            >
              Add new block
            </VSCodeTextField>
          </div>
          <VSCodeButton
            appearance="secondary"
            onClick={handleCancelNewBlockAdd}
          >
            Cancel
          </VSCodeButton>
          <VSCodeButton onClick={handleSaveNewBlock}>Save</VSCodeButton>
        </div>
      )}

      <VSCodeDivider />

      {/* <h1>activityUndoStack</h1>
      {JSON.stringify(activityUndoStack)}
      <h1>activityRedoStack</h1>
      {JSON.stringify(activityRedoStack)} */}

      {renderBlocks(state)}
    </div>
  );
};
export default ReactFCComponent;
