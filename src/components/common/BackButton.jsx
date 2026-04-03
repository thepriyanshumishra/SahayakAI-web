import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const BackButton = ({ className = "" }) => {
  const navigate = useNavigate();

  return (
    <motion.button
      whileHover={{ scale: 1.05, x: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate(-1)}
      className={`flex items-center gap-2 px-4 py-2 rounded-full 
                 bg-white/10 backdrop-blur-md border border-white/20 
                 text-white hover:bg-white/20 transition-all cursor-pointer 
                 shadow-lg group mb-6 w-fit ${className}`}
    >
      <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
      <span className="font-medium">Go Back</span>
    </motion.button>
  );
};

export default BackButton;
