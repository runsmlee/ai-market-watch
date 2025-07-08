'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dna } from 'lucide-react';

interface DNAMatchFloatingButtonProps {
  onClick: () => void;
}

export default function DNAMatchFloatingButton({ onClick }: DNAMatchFloatingButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 
                 rounded-full shadow-lg hover:scale-110 transition-all duration-300 
                 flex items-center justify-center group"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
        }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 1 
        }}
      >
        {/* Pulsing Ring Animation */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
          animate={{
            scale: [1, 1.3, 1.3],
            opacity: [0.5, 0, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
        
        {/* Icon */}
        <Dna className="w-6 h-6 text-white relative z-10" />
        
        {/* Sparkle effect on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute inset-0 rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  initial={{ 
                    x: 0, 
                    y: 0,
                    opacity: 0 
                  }}
                  animate={{ 
                    x: Math.cos(i * 60 * Math.PI / 180) * 30,
                    y: Math.sin(i * 60 * Math.PI / 180) * 30,
                    opacity: [0, 1, 0]
                  }}
                  transition={{ 
                    duration: 0.6,
                    delay: i * 0.1
                  }}
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      
      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 10, x: 0 }}
            className="fixed bottom-24 right-8 z-50 px-4 py-2 bg-black/90 backdrop-blur-xl 
                     border border-white/20 rounded-lg shadow-xl"
          >
            <p className="text-sm text-white font-medium whitespace-nowrap">
              Find your startup DNA match
            </p>
            <div className="absolute -bottom-1 right-6 w-2 h-2 bg-black/90 
                          border-r border-b border-white/20 transform rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}