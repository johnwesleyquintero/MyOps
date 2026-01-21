import { useState, useEffect, useMemo } from "react";
import { AppConfig } from "../types";
import { INITIAL_CONFIG_KEY, DEFAULT_GAS_URL } from "@/constants";

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
    try {
      const saved = localStorage.getItem(INITIAL_CONFIG_KEY);
      if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    } catch (e) {
      console.warn("Failed to parse config from local storage", e);
    }
    return DEFAULT_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem(INITIAL_CONFIG_KEY, JSON.stringify(config));
  }, [config]);

  return useMemo(
    () => ({
      config,
      setConfig,
    }),
    [config],
  );
};
