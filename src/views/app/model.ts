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
  content: IConfig;
}

export enum CommandAction {
  Save,
}

export interface IEnvConfig {
  name: string;
  value: string;
  enabled: boolean;
}
export interface IEnvConfigBlock {
  name: string;
  items: IEnvConfig[];
}

export interface IEnvConfigFile {
  [name: string]: IEnvConfigBlock;
}
