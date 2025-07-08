'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dna, 
  Sparkles, 
  Building2, 
  Target, 
  Users, 
  DollarSign,
  Brain,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import DNAMatchForm from '@/components/dna/DNAMatchForm';
import DNAMatchResults from '@/components/dna/DNAMatchResults';
import { analyzeDNA } from '@/lib/dna-analysis';

interface DNAAnalysisResult {
  userStartup: {
    id: string;
    embedding: number[];
  };
  matches: Array<{
    id: string;
    companyName: string;
    similarity: number;
    category: string;
    description: string;
    fundingRaised: string;
    yearFounded: number;
  }>;
  insights: {
    commonPatterns: string[];
    differentiators: string[];
    opportunities: string[];
    recommendations: string[];
  };
}

export default function DNAMatchPage() {
  const [stage, setStage] = useState<'input' | 'analyzing' | 'results'>('input');
  const [analysisResult, setAnalysisResult] = useState<DNAAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: any) => {
    setStage('analyzing');
    setError(null);
    
    try {
      // Send to n8n webhook for processing
      const result = await analyzeDNA(formData);
      setAnalysisResult(result);
      setStage('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setStage('input');
    }
  };

  const handleReset = () => {
    setStage('input');
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-950">
      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl 
                     border border-white/10 rounded-full mb-8"
          >
            <Dna className="w-4 h-4 text-white/70" />
            <span className="text-sm text-white/70 font-medium">AI-Powered Startup Analysis</span>
          </motion.div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
            <span className="text-gradient-elegant">Find Your</span>
            <br />
            <span className="text-white">Startup DNA Match</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover startups with similar DNA to yours. Get AI-powered insights 
            on patterns, opportunities, and strategic recommendations.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">800+</div>
              <div className="text-sm text-gray-500">Startups Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">168</div>
              <div className="text-sm text-gray-500">AI Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">95%</div>
              <div className="text-sm text-gray-500">Match Accuracy</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <AnimatePresence mode="wait">
          {stage === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <DNAMatchForm onSubmit={handleSubmit} error={error} />
            </motion.div>
          )}

          {stage === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto text-center py-20"
            >
              <div className="mb-8">
                <div className="relative inline-flex">
                  <Dna className="w-16 h-16 text-white animate-pulse" />
                  <div className="absolute inset-0 animate-ping">
                    <Dna className="w-16 h-16 text-white/30" />
                  </div>
                </div>
              </div>
              
              <h2 className="text-2xl font-semibold text-white mb-4">
                Analyzing Your Startup DNA
              </h2>
              
              <div className="space-y-3 max-w-md mx-auto">
                <AnalysisStep 
                  icon={<Brain className="w-4 h-4" />}
                  text="Processing startup information"
                  delay={0}
                />
                <AnalysisStep 
                  icon={<Sparkles className="w-4 h-4" />}
                  text="Finding similar DNA patterns"
                  delay={0.5}
                />
                <AnalysisStep 
                  icon={<Target className="w-4 h-4" />}
                  text="Generating strategic insights"
                  delay={1}
                />
              </div>
            </motion.div>
          )}

          {stage === 'results' && analysisResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DNAMatchResults 
                result={analysisResult} 
                onReset={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Analysis step component
function AnalysisStep({ 
  icon, 
  text, 
  delay 
}: { 
  icon: React.ReactNode; 
  text: string; 
  delay: number;
}) {
  const [show, setShow] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: show ? 1 : 0.3, x: 0 }}
      className="flex items-center gap-3 text-left"
    >
      <div className={`transition-colors duration-500 ${
        show ? 'text-green-400' : 'text-gray-600'
      }`}>
        {show ? <CheckCircle2 className="w-5 h-5" /> : icon}
      </div>
      <span className={`transition-colors duration-500 ${
        show ? 'text-white' : 'text-gray-500'
      }`}>
        {text}
      </span>
    </motion.div>
  );
}