import { AppConfig } from "../types";
import { postToGas, fetchFromGas } from "../utils/gasUtils";

export const DEMO_DELAY = 50;

export interface ServiceActionOptions<T> {
  module: string;
  config: AppConfig;
  demoLogic: () => T | Promise<T>;
  actionName: string;
  entry?: unknown;
}

export const executeServiceAction = async <T>({
  module,
  config,
  demoLogic,
  actionName,
  entry,
}: ServiceActionOptions<T>): Promise<T> => {
  if (config.mode === "DEMO") {
    await new Promise((resolve) => setTimeout(resolve, DEMO_DELAY));
    return demoLogic();
  } else {
    if (actionName === "fetch") {
      return (await fetchFromGas<T>(config, module)) as unknown as T;
    }

    if (!config.gasDeploymentUrl) throw new Error("GAS URL not configured");

    await postToGas(config.gasDeploymentUrl, {
      action: actionName,
      module,
      entry,
      token: config.apiToken,
    });

    return entry as unknown as T;
  }
};
