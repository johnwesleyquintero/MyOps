import React, { ReactNode } from "react";
import { ConfigContext } from "./ConfigContext";
import { useAppConfig } from "../hooks/useAppConfig";

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { config, setConfig } = useAppConfig();
  return (
    <ConfigContext.Provider value={{ config, setConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};
