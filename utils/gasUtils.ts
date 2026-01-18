import { AppConfig } from "../types";

export const postToGas = async (
  url: string,
  payload: Record<string, unknown>,
) => {
  await fetch(url, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });
};

export const fetchFromGas = async <T>(
  config: AppConfig,
  module: string,
): Promise<T[]> => {
  if (!config.gasDeploymentUrl) throw new Error("GAS URL not configured");
  if (!config.apiToken) throw new Error("API Token required");

  try {
    const urlWithToken = `${config.gasDeploymentUrl}?token=${encodeURIComponent(config.apiToken)}&module=${module}&t=${new Date().getTime()}`;

    const response = await fetch(urlWithToken, {
      method: "GET",
      redirect: "follow",
    });
    if (!response.ok) throw new Error("Network response was not ok");

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Invalid response from server.");
    }

    if (data && data.status === "error") throw new Error(data.message);

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Fetch Error [${module}]:`, error);
    throw error;
  }
};
