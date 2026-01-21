import { createContext } from "react";
import { AppConfig } from "../types";

export interface ConfigContextType {
  config: AppConfig;
  setConfig: (config: AppConfig) => void;
}

export const ConfigContext = createContext<ConfigContextType | undefined>(
  undefined,
);
