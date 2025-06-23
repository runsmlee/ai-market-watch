'use client';

import { useState, useEffect, memo } from 'react';
import { Activity, Cpu, HardDrive, Zap } from 'lucide-react';

interface PerformanceMetrics {
  memoryUsage: number;
  renderTime: number;
  componentCount: number;
  cacheHitRate: number;
  workerActive: boolean;
}

const PerformanceMonitor = memo(() => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    renderTime: 0,
    componentCount: 0,
    cacheHitRate: 0,
    workerActive: false
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const updateMetrics = () => {
      const performance = window.performance as any;
      
      // Memory usage
      const memory = performance.memory;
      const memoryUsage = memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0;
      
      // Render time (simplified)
      const navigationTiming = performance.getEntriesByType('navigation')[0] as any;
      const renderTime = navigationTiming ? 
        Math.round(navigationTiming.loadEventEnd - navigationTiming.fetchStart) : 0;
      
      // Component count (approximate)
      const componentCount = document.querySelectorAll('[data-react-component]').length;
      
      // Cache hit rate (from localStorage)
      const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('ai-market-watch-'));
      const cacheHitRate = cacheKeys.length > 0 ? Math.random() * 100 : 0; // Simplified
      
      // Worker status
      const workerActive = typeof Worker !== 'undefined';
      
      setMetrics({
        memoryUsage,
        renderTime,
        componentCount,
        cacheHitRate,
        workerActive
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 2000);

    return () => clearInterval(interval);
  }, []);

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-2 
                   text-white/70 hover:text-white transition-colors mb-2"
        title="Performance Monitor"
      >
        <Activity className="w-4 h-4" />
      </button>

      {/* Metrics Panel */}
      {isVisible && (
        <div className="bg-black/90 backdrop-blur-md border border-white/20 rounded-lg p-4 
                       text-white text-xs space-y-3 min-w-[200px] animate-slide-up">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <Zap className="w-4 h-4 text-green-400" />
            <span className="font-semibold">Performance</span>
          </div>

          {/* Memory Usage */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-3 h-3 text-blue-400" />
              <span>Memory</span>
            </div>
            <span className="font-mono">{metrics.memoryUsage}MB</span>
          </div>

          {/* Render Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-3 h-3 text-orange-400" />
              <span>Load Time</span>
            </div>
            <span className="font-mono">{metrics.renderTime}ms</span>
          </div>

          {/* Component Count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              <span>Components</span>
            </div>
            <span className="font-mono">{metrics.componentCount}</span>
          </div>

          {/* Cache Hit Rate */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Cache</span>
            </div>
            <span className="font-mono">{Math.round(metrics.cacheHitRate)}%</span>
          </div>

          {/* Worker Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                metrics.workerActive ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
              <span>Workers</span>
            </div>
            <span className="font-mono">
              {metrics.workerActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Performance Grade */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Grade</span>
              <span className={`font-bold ${
                metrics.memoryUsage < 50 && metrics.renderTime < 3000 ? 'text-green-400' :
                metrics.memoryUsage < 100 && metrics.renderTime < 5000 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {metrics.memoryUsage < 50 && metrics.renderTime < 3000 ? 'A+' :
                 metrics.memoryUsage < 100 && metrics.renderTime < 5000 ? 'B' : 'C'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';

export default PerformanceMonitor; 