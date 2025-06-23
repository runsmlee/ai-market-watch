'use client';

import { ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-8 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          {/* Main Footer Content */}
          <div className="flex flex-col sm:flex-row items-center gap-2 text-white/50">
            <span>© 2025 AI Market Watch</span>
            <span className="hidden sm:inline text-white/30">•</span>
            <span>AI Startups Intelligence Platform</span>
          </div>
          
          {/* WeeklyVentures Credit */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white/[0.03] border border-white/[0.06] 
                         rounded hover:bg-white/[0.05] transition-colors duration-200">
            <span className="text-white/60">Powered by</span>
            <a
              href="https://weeklyventures.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-orange-400 
                       hover:text-orange-300 transition-colors duration-200"
            >
              WeeklyVentures
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
} 