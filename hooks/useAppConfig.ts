import { useState, useEffect, useMemo } from "react";
import { AppConfig } from "../types";
import { INITIAL_CONFIG_KEY, DEFAULT_GAS_URL } from "@/constants";
import { storage } from "../utils/storageUtils";

const DEFAULT_CONFIG: AppConfig = {
  mode: "DEMO", // Changed from LIVE to DEMO for smoother first-run
  gasDeploymentUrl: DEFAULT_GAS_URL,
  apiToken: "",
  currency: "USD",
  locale: "en-US",
  theme: "LIGHT",
  geminiApiKey: "",
};

export const useAppConfig = () => {
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = storage.get<Partial<AppConfig> | null>(
      INITIAL_CONFIG_KEY,
      null,
    );
    if (saved) return { ...DEFAULT_CONFIG, ...saved };
    return DEFAULT_CONFIG;
  });

  useEffect(() => {
    storage.set(INITIAL_CONFIG_KEY, config);
  }, [config]);

  return useMemo(
    () => ({
      config,
      setConfig,
    }),
    [config],
  );
};
