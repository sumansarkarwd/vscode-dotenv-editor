export interface IConfig {
  name: string;
  description: string;
  users: IUser[];
}
export interface IUser {
  name: string;
  active: boolean;
  roles: string[];
}

export interface ICommand {
  action: CommandAction;
  content: IEnvConfigFile;
}

export enum CommandAction {
  Save,
}

export interface IEnvConfig {
  id: string;
  name: string;
  value: string;
  enabled: boolean;
}
export interface IEnvConfigBlock {
  name: string;
  items: IEnvConfig[];
  enabled: boolean;
}

export interface IEnvConfigFile {
  [name: string]: IEnvConfigBlock;
}

export enum IEdtorAction {
  AddItem,
  DeleteItem,
}

export interface IEdtorActionStep {
  action: IEdtorAction;
  data: {
    block?: IEnvConfigBlock;
    item?: IEnvConfig;
    blockName?: string;
    itemId?: string;
  };
}
