'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Target, 
  Users, 
  DollarSign, 
  Globe, 
  Calendar,
  ChevronRight,
  AlertCircle,
  Sparkles
} from 'lucide-react';

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

interface DNAMatchFormProps {
  onSubmit: (data: FormData) => void;
  error: string | null;
}

const categories = [
  'Generative AI', 'Computer Vision', 'NLP', 'MLOps', 'Healthcare AI',
  'Fintech AI', 'Robotics', 'Autonomous Systems', 'AI Infrastructure',
  'Enterprise AI', 'Consumer AI', 'Education AI', 'Legal AI', 'Sales AI',
  'Marketing AI', 'Security AI', 'Data Analytics', 'Other'
];

const fundingStages = [
  'Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Bootstrapped'
];

export default function DNAMatchForm({ onSubmit, error }: DNAMatchFormProps) {
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid = () => {
    return formData.companyName && 
           formData.description && 
           formData.category &&
           formData.problem &&
           formData.solution;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Analysis Failed</p>
            <p className="text-red-400/70 text-sm mt-1">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Basic Information */}
      <div className="bg-black/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
          <Building2 className="w-6 h-6 text-white/70" />
          Basic Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Enter your startup name"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg
                       text-white placeholder-gray-500 focus:border-white/30 focus:bg-gray-800
                       transition-all duration-200"
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
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg
                       text-white placeholder-gray-500 focus:border-white/30 focus:bg-gray-800
                       transition-all duration-200"
              required
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Briefly describe what your startup does (2-3 sentences)"
              rows={3}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg
                       text-white placeholder-gray-500 focus:border-white/30 focus:bg-gray-800
                       transition-all duration-200 resize-none"
              required
            />
          </div>
        </div>
      </div>

      {/* Problem & Solution */}
      <div className="bg-black/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
          <Target className="w-6 h-6 text-white/70" />
          Problem & Solution
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Problem You&apos;re Solving *
            </label>
            <textarea
              name="problem"
              value={formData.problem}
              onChange={handleChange}
              placeholder="What specific problem are you addressing?"
              rows={3}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg
                       text-white placeholder-gray-500 focus:border-white/30 focus:bg-gray-800
                       transition-all duration-200 resize-none"
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
              rows={3}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg
                       text-white placeholder-gray-500 focus:border-white/30 focus:bg-gray-800
                       transition-all duration-200 resize-none"
              required
            />
          </div>
        </div>
      </div>

      {/* Market & Business */}
      <div className="bg-black/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
          <Users className="w-6 h-6 text-white/70" />
          Market & Business Model
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Target Market
            </label>
            <input
              type="text"
              name="targetMarket"
              value={formData.targetMarket}
              onChange={handleChange}
              placeholder="e.g., SMBs, Enterprise, Consumers"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg
                       text-white placeholder-gray-500 focus:border-white/30 focus:bg-gray-800
                       transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Business Model
            </label>
            <input
              type="text"
              name="businessModel"
              value={formData.businessModel}
              onChange={handleChange}
              placeholder="e.g., SaaS, Marketplace, API"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg
                       text-white placeholder-gray-500 focus:border-white/30 focus:bg-gray-800
                       transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Team & Funding */}
      <div className="bg-black/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
          <DollarSign className="w-6 h-6 text-white/70" />
          Team & Funding
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Team Size
            </label>
            <input
              type="text"
              name="teamSize"
              value={formData.teamSize}
              onChange={handleChange}
              placeholder="e.g., 5-10 people"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg
                       text-white placeholder-gray-500 focus:border-white/30 focus:bg-gray-800
                       transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Funding Stage
            </label>
            <select
              name="fundingStage"
              value={formData.fundingStage}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg
                       text-white placeholder-gray-500 focus:border-white/30 focus:bg-gray-800
                       transition-all duration-200"
            >
              <option value="">Select stage</option>
              {fundingStages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., San Francisco, CA"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg
                       text-white placeholder-gray-500 focus:border-white/30 focus:bg-gray-800
                       transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Year Founded
            </label>
            <input
              type="number"
              name="yearFounded"
              value={formData.yearFounded}
              onChange={handleChange}
              min="2000"
              max={new Date().getFullYear()}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg
                       text-white placeholder-gray-500 focus:border-white/30 focus:bg-gray-800
                       transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center"
      >
        <button
          type="submit"
          disabled={!isFormValid()}
          className="group relative px-8 py-4 bg-white text-black font-semibold rounded-xl
                   hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-300
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
                   overflow-hidden"
        >
          <div className="relative z-10 flex items-center gap-3">
            <Sparkles className="w-5 h-5" />
            <span>Analyze My Startup DNA</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
          
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 
                        opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        </button>
      </motion.div>
    </form>
  );
}