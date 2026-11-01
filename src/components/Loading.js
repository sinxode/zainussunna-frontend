import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import '../styles/Loading.scss';

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="loading-page-overlay">
      <div className="loading-container">
        {/* Decorative background elements */}
        <div className="bg-glow orb-1"></div>
        <div className="bg-glow orb-2"></div>
        
        <div className="loading-card">
          <div className="visual-orchestra">
            <div className="pulse-ring ring-1"></div>
            <div className="pulse-ring ring-2"></div>
            <div className="pulse-ring ring-3"></div>
            
            <div className="icon-center">
              <Loader2 className="main-spinner" size={48} />
              <Sparkles className="sparkle-accent" size={20} />
            </div>
          </div>
          
          <div className="text-content">
            <h2 className="loading-title">{message}</h2>
            <div className="progress-bar-container">
              <div className="progress-bar-fill"></div>
            </div>
            <p className="loading-subtitle">Zainussunna Academy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
