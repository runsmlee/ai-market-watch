'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Dna, 
  Sparkles, 
  Building2, 
  Target, 
  ChevronRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Brain,
  Mail,
  Download,
  Lock,
  ExternalLink
} from 'lucide-react';
import { analyzeDNA } from '@/lib/dna-analysis';

interface DNAMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  companyName: string;
  description: string;
  category: string;
  problem: string;
  solution: string;
  targetMarket: string;
  businessModel: string;
  teamSize: string;
  fundingStage: string;
  location: string;
  yearFounded: string;
}

const categories = [
  'Generative AI', 'Computer Vision', 'NLP', 'MLOps', 'Healthcare AI',
  'Fintech AI', 'Robotics', 'Autonomous Systems', 'AI Infrastructure',
  'Enterprise AI', 'Consumer AI', 'Education AI', 'Legal AI', 'Sales AI',
  'Marketing AI', 'Security AI', 'Data Analytics', 'Other'
];

export default function DNAMatchModal({ isOpen, onClose }: DNAMatchModalProps) {
  const [stage, setStage] = useState<'input' | 'analyzing' | 'results' | 'email'>('input');
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    description: '',
    category: '',
    problem: '',
    solution: '',
    targetMarket: '',
    businessModel: '',
    teamSize: '',
    fundingStage: '',
    location: '',
    yearFounded: new Date().getFullYear().toString()
  });
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStage('analyzing');
    setError(null);
    
    try {
      const result = await analyzeDNA(formData);
      setAnalysisResult(result);
      setStage('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setStage('input');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSubmitted(true);
    
    // Send email to API
    try {
      await fetch('/api/send-dna-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          analysisResult,
          formData
        })
      });
      
      // Show success state
      setTimeout(() => {
        setStage('email');
      }, 500);
    } catch (err) {
      console.error('Email sending failed:', err);
    }
  };

  const handleReset = () => {
    setStage('input');
    setFormData({
      companyName: '',
      description: '',
      category: '',
      problem: '',
      solution: '',
      targetMarket: '',
      businessModel: '',
      teamSize: '',
      fundingStage: '',
      location: '',
      yearFounded: new Date().getFullYear().toString()
    });
    setAnalysisResult(null);
    setEmail('');
    setEmailSubmitted(false);
    setError(null);
  };

  const handleCompanyClick = (companyName: string) => {
    // Use company name in URL for better SEO and easier lookup
    const encodedName = encodeURIComponent(companyName);
    window.open(`/company/${encodedName}`, '_blank');
  };

  const isFormValid = () => {
    return formData.companyName && 
           formData.description && 
           formData.category &&
           formData.problem &&
           formData.solution;
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="glass-strong backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] 
                          overflow-hidden pointer-events-auto border border-white/[0.15]">
              
              {/* Header */}
              <div className="relative px-6 py-4 border-b border-white/[0.08] bg-white/[0.02] backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg">
                      <Dna className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      Find Your Startup DNA Match
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white/70" />
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                <AnimatePresence mode="wait">
                  {stage === 'input' && (
                    <motion.div
                      key="input"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-6 bg-white/[0.01]"
                    >
                      <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Alert */}
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3"
                          >
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-red-400 font-medium">Analysis Failed</p>
                              <p className="text-red-400/70 text-sm mt-1">{error}</p>
                            </div>
                          </motion.div>
                        )}

                        {/* Form Fields */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-2">
                                Company Name *
                              </label>
                              <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                placeholder="Your startup name"
                                className="w-full px-4 py-2 bg-white/[0.06] border border-white/[0.12] rounded-lg
                                         text-white placeholder-gray-500 focus:border-orange-500 focus:bg-white/[0.08]
                                         transition-all duration-200 text-sm"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-2">
                                Category *
                              </label>
                              <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white/[0.06] border border-white/[0.12] rounded-lg
                                         text-white placeholder-gray-500 focus:border-orange-500 focus:bg-white/[0.08]
                                         transition-all duration-200 text-sm"
                                required
                              >
                                <option value="">Select category</option>
                                {categories.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                              Description *
                            </label>
                            <textarea
                              name="description"
                              value={formData.description}
                              onChange={handleChange}
                              placeholder="What does your startup do? (2-3 sentences)"
                              rows={2}
                              className="w-full px-4 py-2 bg-white/[0.06] border border-white/[0.12] rounded-lg
                                       text-white placeholder-gray-500 focus:border-orange-500 focus:bg-white/[0.08]
                                       transition-all duration-200 resize-none text-sm"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                              Problem You&apos;re Solving *
                            </label>
                            <textarea
                              name="problem"
                              value={formData.problem}
                              onChange={handleChange}
                              placeholder="What specific problem are you addressing?"
                              rows={2}
                              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg
                                       text-white placeholder-gray-500 focus:border-purple-500 focus:bg-gray-800
                                       transition-all duration-200 resize-none text-sm"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                              Your Solution *
                            </label>
                            <textarea
                              name="solution"
                              value={formData.solution}
                              onChange={handleChange}
                              placeholder="How does your product/service solve this problem?"
                              rows={2}
                              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg
                                       text-white placeholder-gray-500 focus:border-purple-500 focus:bg-gray-800
                                       transition-all duration-200 resize-none text-sm"
                              required
                            />
                          </div>
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={!isFormValid()}
                          className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white 
                                   font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(249,115,22,0.5)] 
                                   transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                                   flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-5 h-5" />
                          Analyze My Startup DNA
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {stage === 'analyzing' && (
                    <motion.div
                      key="analyzing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-12 text-center bg-white/[0.01]"
                    >
                      <div className="mb-8">
                        <div className="relative inline-flex">
                          <Dna className="w-16 h-16 text-orange-400 animate-pulse" />
                          <div className="absolute inset-0 animate-ping">
                            <Dna className="w-16 h-16 text-orange-400/30" />
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-white mb-4">
                        Analyzing Your Startup DNA
                      </h3>
                      
                      <div className="space-y-3 max-w-sm mx-auto">
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
                      className="p-6 bg-white/[0.01]"
                    >
                      {/* Preview Results */}
                      <div className="space-y-6">
                        <div className="text-center">
                          <h3 className="text-2xl font-bold text-white mb-2">
                            We Found Your DNA Matches!
                          </h3>
                          <p className="text-gray-400">
                            Here&apos;s a preview of your top 3 matches
                          </p>
                        </div>

                        {/* Top 3 Matches */}
                        <div className="space-y-3">
                          {analysisResult.matches.slice(0, 3).map((match: any, index: number) => (
                            <motion.button
                              key={match.id}
                              onClick={() => handleCompanyClick(match.companyName)}
                              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 
                                       hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-200
                                       text-left group cursor-pointer"
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors">
                                    {match.companyName}
                                  </h4>
                                  <p className="text-sm text-gray-500 mt-0.5">
                                    {match.category} • {Math.round(match.similarity * 100)}% Match
                                  </p>
                                </div>
                                <div className="text-3xl font-bold text-gray-700">
                                  #{index + 1}
                                </div>
                              </div>
                              
                              {/* Simplified Similarity Section */}
                              {match.whySimilar && (
                                <div className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg p-3 border border-white/[0.05]">
                                  <p className="text-xs font-medium text-blue-300 uppercase tracking-wider mb-1">Similarity</p>
                                  <p className="text-sm text-gray-300 leading-relaxed line-clamp-2">
                                    {match.whySimilar}
                                  </p>
                                </div>
                              )}
                              
                              {/* Hover indicator */}
                              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                                <ExternalLink className="w-3 h-3" />
                                <span>Open in new tab</span>
                              </div>
                            </motion.button>
                          ))}
                        </div>

                        {/* Teaser for locked content */}
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent z-10" />
                          <div className="blur-sm opacity-50">
                            <h4 className="text-lg font-semibold text-white mb-3">
                              Key Insights & Recommendations
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white/[0.06] rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-8 h-8 bg-blue-500/20 rounded" />
                                  <div className="h-4 bg-gray-700 rounded w-32" />
                                </div>
                                <div className="space-y-1">
                                  <div className="h-3 bg-gray-700 rounded" />
                                  <div className="h-3 bg-gray-700 rounded w-4/5" />
                                </div>
                              </div>
                              <div className="bg-white/[0.06] rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-8 h-8 bg-orange-500/20 rounded" />
                                  <div className="h-4 bg-gray-700 rounded w-32" />
                                </div>
                                <div className="space-y-1">
                                  <div className="h-3 bg-gray-700 rounded" />
                                  <div className="h-3 bg-gray-700 rounded w-4/5" />
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Lock overlay */}
                          <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="text-center">
                              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <p className="text-white font-semibold mb-1">
                                Get Your Complete DNA Analysis
                              </p>
                              <p className="text-gray-400 text-sm">
                                Including all 3 matches, insights & recommendations
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Email Form */}
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                              Enter your email to receive the full report
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="flex-1 px-4 py-2 bg-white/[0.06] border border-white/[0.12] rounded-lg
                                         text-white placeholder-gray-500 focus:border-orange-500
                                         transition-all duration-200"
                                required
                              />
                              <button
                                type="submit"
                                disabled={!email || emailSubmitted}
                                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 
                                         text-white font-medium rounded-lg hover:shadow-lg
                                         transition-all duration-300 disabled:opacity-50 
                                         disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                {emailSubmitted ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Sent!
                                  </>
                                ) : (
                                  <>
                                    <Mail className="w-4 h-4" />
                                    Get Report
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              We&apos;ll send you a detailed PDF report with actionable insights
                            </p>
                          </div>
                        </form>
                      </div>
                    </motion.div>
                  )}

                  {stage === 'email' && (
                    <motion.div
                      key="email"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="p-12 text-center bg-white/[0.01]"
                    >
                      <div className="mb-6">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center 
                                      justify-center mx-auto mb-4">
                          <CheckCircle2 className="w-10 h-10 text-green-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          Check Your Email!
                        </h3>
                        <p className="text-gray-400 max-w-sm mx-auto">
                          We&apos;ve sent your complete DNA analysis report to <strong>{email}</strong>
                        </p>
                      </div>
                      
                      <div className="space-y-3 max-w-sm mx-auto mb-8">
                        <div className="flex items-center gap-3 text-left">
                          <Download className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-300">Full PDF report with all insights</span>
                        </div>
                        <div className="flex items-center gap-3 text-left">
                          <Building2 className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-300">All 3 matching companies analyzed</span>
                        </div>
                        <div className="flex items-center gap-3 text-left">
                          <Target className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-300">Actionable recommendations</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleReset}
                        className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 
                                 text-white font-medium rounded-lg transition-all duration-200"
                      >
                        Analyze Another Startup
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>
      
    </>
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
      <span className={`transition-colors duration-500 text-sm ${
        show ? 'text-white' : 'text-gray-500'
      }`}>
        {text}
      </span>
    </motion.div>
  );
}