import { useRef, useCallback, useEffect } from 'react';

interface WorkerMessage {
  type: string;
  data?: any;
  error?: string;
}

interface UseWebWorkerOptions {
  workerPath: string;
  onMessage?: (message: WorkerMessage) => void;
  onError?: (error: ErrorEvent) => void;
}

export function useWebWorker({ workerPath, onMessage, onError }: UseWebWorkerOptions) {
  const workerRef = useRef<Worker | null>(null);
  const callbacksRef = useRef<Map<string, (data: any) => void>>(new Map());

  // Initialize worker
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const currentCallbacks = callbacksRef.current;

    try {
      workerRef.current = new Worker(workerPath);
      
      workerRef.current.onmessage = (event: MessageEvent<WorkerMessage>) => {
        const { type, data, error } = event.data;
        
        if (error) {
          console.error('Worker error:', error);
          onError?.(new ErrorEvent('WorkerError', { message: error }));
          return;
        }
        
        // Handle callbacks
        const callback = currentCallbacks.get(type);
        if (callback) {
          callback(data);
          currentCallbacks.delete(type);
        }
        
        // Call general message handler
        onMessage?.(event.data);
      };
      
      workerRef.current.onerror = (error: ErrorEvent) => {
        console.error('Worker error:', error);
        onError?.(error);
      };
      
    } catch (error) {
      console.error('Failed to create worker:', error);
      onError?.(new ErrorEvent('WorkerCreationError', { message: 'Failed to create worker' }));
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      currentCallbacks.clear();
    };
  }, [workerPath, onMessage, onError]);

  // Post message to worker
  const postMessage = useCallback((type: string, data?: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not initialized'));
        return;
      }

      const successType = `${type}_SUCCESS`;
      const errorType = 'ERROR';
      
      // Set up callback for success
      callbacksRef.current.set(successType, resolve);
      
      // Set up callback for error
      callbacksRef.current.set(errorType, (error) => {
        reject(new Error(error));
      });
      
      // Post message to worker
      workerRef.current.postMessage({ type, data });
    });
  }, []);

  // Terminate worker
  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    callbacksRef.current.clear();
  }, []);

  return {
    postMessage,
    terminate,
    isReady: !!workerRef.current
  };
} 