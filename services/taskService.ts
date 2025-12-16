
import { TaskEntry, AppConfig } from '../types';
import { LOCAL_STORAGE_KEY } from '../constants';
import { getMockData } from './mockFactory';

// Helper to send POST requests
const postToGas = async (url: string, payload: any) => {
  await fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
};

export const fetchTasks = async (config: AppConfig): Promise<TaskEntry[]> => {
  if (config.mode === 'DEMO') {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) {
      const initialData = getMockData();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(stored);
  } else {
    // LIVE MODE
    if (!config.gasDeploymentUrl) throw new Error("GAS URL not configured");
    if (!config.apiToken) throw new Error("API Token required");

    try {
      const urlWithToken = `${config.gasDeploymentUrl}?token=${encodeURIComponent(config.apiToken)}&t=${new Date().getTime()}`;
      
      const response = await fetch(urlWithToken, { method: 'GET', redirect: 'follow' });
      if (!response.ok) throw new Error("Network response was not ok");
      
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Invalid response from server.");
      }
      
      if (data && data.status === "error") throw new Error(data.message);
      
      const entries = Array.isArray(data) ? data : [];
      return entries;

    } catch (error) {
      console.error("Fetch Error:", error);
      throw error;
    }
  }
};

export const addTask = async (entry: TaskEntry, config: AppConfig): Promise<TaskEntry> => {
  const entryWithId = { ...entry, id: entry.id || crypto.randomUUID() };

  if (config.mode === 'DEMO') {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    const current = stored ? JSON.parse(stored) : [];
    // Ensure new items are at the top if sorting logic permits, or just append. 
    // We stick to append here, UI handles sort.
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([entryWithId, ...current]));
  } else {
    if (!config.gasDeploymentUrl) throw new Error("GAS URL not configured");
    await postToGas(config.gasDeploymentUrl, { 
      action: 'create', 
      entry: entryWithId,
      token: config.apiToken 
    });
  }
  
  return entryWithId;
};

export const updateTask = async (entry: TaskEntry, config: AppConfig): Promise<void> => {
  if (config.mode === 'DEMO') {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    let current: TaskEntry[] = stored ? JSON.parse(stored) : [];
    current = current.map(e => e.id === entry.id ? entry : e);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } else {
    if (!config.gasDeploymentUrl) throw new Error("GAS URL not configured");
    await postToGas(config.gasDeploymentUrl, { 
      action: 'update', 
      entry,
      token: config.apiToken 
    });
  }
};

export const deleteTask = async (id: string, config: AppConfig): Promise<void> => {
  if (config.mode === 'DEMO') {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    let current: TaskEntry[] = stored ? JSON.parse(stored) : [];
    current = current.filter(e => e.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } else {
    if (!config.gasDeploymentUrl) throw new Error("GAS URL not configured");
    await postToGas(config.gasDeploymentUrl, { 
      action: 'delete', 
      entry: { id },
      token: config.apiToken 
    });
  }
};
