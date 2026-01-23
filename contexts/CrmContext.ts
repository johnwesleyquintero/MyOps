import { createContext } from "react";
import { useCrm } from "../hooks/useCrm";

export type CrmContextType = ReturnType<typeof useCrm>;

export const CrmContext = createContext<CrmContextType | undefined>(undefined);
