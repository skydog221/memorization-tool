
import { QAItem, SessionData } from '../types';
import { LOCAL_STORAGE_SESSION_KEY, LOCAL_STORAGE_MISTAKES_KEY } from '../constants';

export class StorageService {
  static saveSession(sessionData: SessionData): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(sessionData));
    } catch (error) {
      console.error("Error saving session to localStorage:", error);
    }
  }

  static loadSession(): SessionData | null {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error loading session from localStorage:", error);
      return null;
    }
  }

  static clearSession(): void {
    try {
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    } catch (error) {
      console.error("Error clearing session from localStorage:", error);
    }
  }

  static saveMistakes(mistakes: QAItem[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_MISTAKES_KEY, JSON.stringify(mistakes));
    } catch (error) {
      console.error("Error saving mistakes to localStorage:", error);
    }
  }

  static loadMistakes(): QAItem[] | null {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_MISTAKES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error loading mistakes from localStorage:", error);
      return null;
    }
  }

  static clearMistakes(): void {
    try {
      localStorage.removeItem(LOCAL_STORAGE_MISTAKES_KEY);
    } catch (error) {
      console.error("Error clearing mistakes from localStorage:", error);
    }
  }
}
