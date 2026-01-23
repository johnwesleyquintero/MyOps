import { useContext } from "react";
import { CrmContext } from "../contexts/CrmContext";

export const useCrmContext = () => {
  const context = useContext(CrmContext);
  if (context === undefined) {
    throw new Error("useCrmContext must be used within a CrmProvider");
  }
  return context;
};
