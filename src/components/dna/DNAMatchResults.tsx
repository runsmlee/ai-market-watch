'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Dna,
  Building2,
  TrendingUp,
  Lightbulb,
  Target,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface DNAMatchResultsProps {
  result: {
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
      whySimilar?: string;
      keyDifferentiators?: string[];
    }>;
    insights: {
      commonPatterns: string[];
      differentiators: string[];
      opportunities: string[];
      recommendations: string[];
    };
  };
  onReset: () => void;
}

export default function DNAMatchResults({ result, onReset }: DNAMatchResultsProps) {
  const { matches, insights } = result;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 
                      border border-green-500/20 rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400 font-medium">Analysis Complete</span>
        </div>
        
        <h2 className="text-4xl font-bold text-white mb-4">
          Your Startup DNA Matches
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          We found {matches.length} startups with similar DNA patterns. 
          Here&apos;s what we discovered about your startup&apos;s potential.
        </p>
      </motion.div>

      {/* DNA Visualization */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative h-32 flex items-center justify-center"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-96 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
        
        {/* DNA Helix Animation */}
        <div className="relative">
          <Dna className="w-16 h-16 text-white animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border border-white/10 rounded-full animate-ping" />
          </div>
        </div>
      </motion.div>

      {/* Matched Companies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        <h3 className="text-2xl font-semibold text-white flex items-center gap-3">
          <Building2 className="w-6 h-6 text-white/70" />
          Similar DNA Startups
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="group relative bg-black/50 backdrop-blur-xl border border-gray-800 
                       rounded-xl p-6 hover:border-gray-700 transition-all duration-300"
            >
              {/* Similarity Badge */}
              <div className="absolute top-4 right-4">
                <div className="px-3 py-1 bg-white/10 rounded-full">
                  <span className="text-sm font-medium text-white">
                    {Math.round(match.similarity * 100)}% Match
                  </span>
                </div>
              </div>

              {/* Company Info */}
              <div className="mb-4">
                <h4 className="text-xl font-semibold text-white mb-2 pr-24">
                  {match.companyName}
                </h4>
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                  <span>{match.category}</span>
                  <span>•</span>
                  <span>Founded {match.yearFounded}</span>
                </div>
                <p className="text-gray-400 line-clamp-3">
                  {match.description}
                </p>
              </div>

              {/* Why Similar Section */}
              {match.whySimilar && (
                <div className="mb-4 p-3 bg-white/5 rounded-lg">
                  <p className="text-sm text-gray-300">
                    <span className="font-medium text-white">Why similar: </span>
                    {match.whySimilar}
                  </p>
                </div>
              )}

              {/* Funding Info */}
              {match.fundingRaised && (
                <div className="pt-4 border-t border-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total Raised</span>
                    <span className="text-sm font-medium text-white">
                      {match.fundingRaised}
                    </span>
                  </div>
                </div>
              )}

              {/* View Details Link */}
              <Link
                href={`/company/${match.id}`}
                className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/0 
                         group-hover:ring-white/10 transition-all duration-300"
              >
                <span className="sr-only">View {match.companyName} details</span>
              </Link>
              
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 
                            transition-opacity duration-300">
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Common Patterns */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-black/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Common Success Patterns
          </h3>
          <ul className="space-y-3">
            {insights.commonPatterns.map((pattern, index) => (
              <li key={index} className="flex items-start gap-3">
                <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">{pattern}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Opportunities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-black/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            Untapped Opportunities
          </h3>
          <ul className="space-y-3">
            {insights.opportunities.map((opportunity, index) => (
              <li key={index} className="flex items-start gap-3">
                <ChevronRight className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">{opportunity}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Differentiators */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-black/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
            <Target className="w-5 h-5 text-orange-400" />
            Key Differentiators
          </h3>
          <ul className="space-y-3">
            {insights.differentiators.map((diff, index) => (
              <li key={index} className="flex items-start gap-3">
                <ChevronRight className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">{diff}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-black/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
            <ArrowRight className="w-5 h-5 text-green-400" />
            Strategic Recommendations
          </h3>
          <ul className="space-y-3">
            {insights.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3">
                <ChevronRight className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">{rec}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
      >
        <button
          onClick={onReset}
          className="px-6 py-3 bg-transparent border border-white/20 text-white 
                   font-medium rounded-lg hover:bg-white/5 transition-all duration-200
                   flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Analyze Another Startup
        </button>
        
        <Link
          href="/"
          className="px-6 py-3 bg-white text-black font-medium rounded-lg
                   hover:bg-gray-100 transition-all duration-200
                   flex items-center justify-center gap-2"
        >
          Explore All Startups
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );
}