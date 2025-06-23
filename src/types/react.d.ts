declare module 'react' {
  export interface ReactNode {}
  export function useState<T>(initialState: T): [T, (value: T) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
  export function useMemo<T>(factory: () => T, deps: any[]): T;
}

declare module 'next' {
  export interface Metadata {
    title?: string;
    description?: string;
    keywords?: string;
    openGraph?: {
      title?: string;
      description?: string;
      type?: string;
    };
  }
}

declare module 'next/font/google' {
  export function Inter(options: { subsets: string[] }): { className: string };
}

declare module 'zustand' {
  export function create<T>(stateCreator: (set: any, get: any) => T): () => T;
}



declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    interface Element {}
    interface ElementClass {}
    interface ElementAttributesProperty {}
    interface ElementChildrenAttribute {}
    interface IntrinsicAttributes {}
    interface IntrinsicClassAttributes<T> {}
  }
}

declare namespace React {
  interface ReactNode {}
} 