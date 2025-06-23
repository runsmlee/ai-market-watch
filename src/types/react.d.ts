declare module 'react' {
  export interface ReactNode {}
  export interface RefObject<T> {
    current: T | null;
  }
  export interface ComponentType<P = {}> {
    (props: P): ReactNode;
    displayName?: string;
  }
  export interface SuspenseProps {
    children: ReactNode;
    fallback?: ReactNode;
  }
  export function useState<T>(initialState: T): [T, (value: T) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
  export function useMemo<T>(factory: () => T, deps: any[]): T;
  export function useRef<T>(initialValue: T): RefObject<T>;
  export function useRef<T>(initialValue: T | null): RefObject<T>;
  export function useRef<T = undefined>(): RefObject<T | undefined>;
  export function memo<T extends ComponentType<any>>(Component: T): T;
  export function lazy<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>): T;
  export const Suspense: ComponentType<SuspenseProps>;
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