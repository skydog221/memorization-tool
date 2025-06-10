
export interface QAItem {
  q: string;
  a: string;
}

export enum View {
  Home = 'HOME',
  Recitation = 'RECITATION',
  Summary = 'SUMMARY',
}

export interface SessionData {
  items: QAItem[];
  currentIndex?: number;
}

// For DiffDisplay component
export interface DiffSegment {
  value: string;
  type: 'common' | 'added' | 'removed';
}
