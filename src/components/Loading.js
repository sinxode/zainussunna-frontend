import React from 'react';
import { Loader2 } from 'lucide-react';
import '../styles/Loading.scss';

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="spinner-wrapper">
          <Loader2 className="spinner-icon" size={40} />
          <div className="pulse-ring"></div>
        </div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
