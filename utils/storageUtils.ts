/**
 * Utility for safe localStorage operations with JSON serialization
 */
export const storage = {
  /**
   * Get an item from localStorage and parse it as JSON
   */
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  /**
   * Save an item to localStorage as a JSON string
   */
  set: <T>(key: string, value: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error);
      return false;
    }
  },

  /**
   * Remove an item from localStorage
   */
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },

  /**
   * Clear all items from localStorage (use with caution)
   */
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  },
};
