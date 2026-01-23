import React, { ReactNode } from "react";
import { CrmContext } from "./CrmContext";
import { useCrm } from "../hooks/useCrm";
import { useConfig } from "../hooks/useConfig";
import { useNotification } from "../hooks/useNotification";

export const CrmProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { config } = useConfig();
  const { showToast } = useNotification();
  const crm = useCrm(config, showToast);

  return <CrmContext.Provider value={crm}>{children}</CrmContext.Provider>;
};
