import { createContext, Dispatch, SetStateAction } from "react";
import { AppConfig } from "../types";

export interface ConfigContextType {
  config: AppConfig;
  setConfig: Dispatch<SetStateAction<AppConfig>>;
}

export const ConfigContext = createContext<ConfigContextType | undefined>(
  undefined,
);
