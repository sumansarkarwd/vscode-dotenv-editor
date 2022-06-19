import * as React from "react";
import { ICommand, CommandAction, IEnvConfigFile, IEnvConfig } from "./model";
import { VSCodeCheckbox, VSCodeTextField, VSCodeTag, VSCodeDivider } from "@vscode/webview-ui-toolkit/react";

interface IConfigProps {
    vscode: any;
    initialData: IEnvConfigFile;
}

interface IConfigState {
    config: IEnvConfigFile;
}

export default class Config extends React.Component<
    IConfigProps,
    IConfigState
> {
    constructor(props: any) {
        super(props);

        let initialData = this.props.initialData;

        let oldState = this.props.vscode.getState();
        if (oldState) {
            this.state = oldState;
        } else {
            this.state = { config: initialData };
        }
    }

    //   private defineState(newSate: IConfigState) {
    //     this.setState(newSate);
    //     this.props.vscode.setState(newSate);
    //   }

    //   onChangeUserActiveState(userIndex: number) {
    //     let newState = { ...this.state };
    //     newState.config.users[userIndex].active = !newState.config.users[userIndex]
    //       .active;

    //     this.defineState(newState);
    //   }

    //   onAddRole(event: React.KeyboardEvent<HTMLInputElement>, userIndex: number) {
    //     if (event.keyCode === 13 && event.currentTarget.value !== "") {
    //       let newState = { ...this.state };
    //       newState.config.users[userIndex].roles.push(event.currentTarget.value);
    //       this.defineState(newState);
    //       event.currentTarget.value = "";
    //     }
    //   }

    //   onAddUser(event: React.KeyboardEvent<HTMLInputElement>) {
    //     if (event.keyCode === 13 && event.currentTarget.value !== "") {
    //       let newState = { ...this.state };
    //       let newUser: IUser = {
    //         name: event.currentTarget.value,
    //         active: true,
    //         roles: []
    //       };
    //       newState.config.users.push(newUser);
    //       this.defineState(newState);
    //       event.currentTarget.value = "";
    //     }
    //   }

    renderItems(items: IEnvConfig[]){
        return items.map((item) => {
            return (
                <div key={item.name}>
                    <VSCodeCheckbox checked={item.enabled}>{item.name}</VSCodeCheckbox>
                    <VSCodeTextField value={item.value} placeholder={`Enter ${item.name}`}/>
                </div>
            );
        });
    }

    renderBlocks(config: IEnvConfigFile) {

        return Object.keys(config).map((key) => {
            return (
                <div key={key}>
                    <VSCodeCheckbox checked={config[key].enabled}><h3>{key}</h3></VSCodeCheckbox>
                    <VSCodeDivider/>

                    {this.renderItems(config[key].items)}
                    <VSCodeDivider/>
                </div>
            );
        });
    }

    render() {
        return (
            <>
                {this.renderBlocks(this.state.config)}
                <br />
                {/* <input
          className="save"
          type="button"
          value="Save the configuration"
        //   onClick={() => this.saveConfig()}
        /> */}
            </>
        );
    }

    //   saveConfig() {
    //     let command: ICommand = {
    //       action: CommandAction.Save,
    //       content: this.state.config
    //     };
    //     this.props.vscode.postMessage(command);
    //   }
}