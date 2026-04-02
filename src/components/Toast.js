import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';
import '../styles/Toast.scss';

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="toast-icon" size={20} />,
    error: <AlertCircle className="toast-icon" size={20} />,
    info: <Info className="toast-icon" size={20} />
  };

  return (
    <div className={`toast-notification ${type}`}>
      {icons[type]}
      <p className="toast-message">{message}</p>
      <button className="toast-close" onClick={onClose}>
        <X size={16} />
      </button>
      <div className="toast-progress"></div>
    </div>
  );
};

export default Toast;
