import React, { useEffect, useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ErrorNotification = ({ error, onClose, autoClose = true, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [error, autoClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Wait for animation to complete
  };

  if (!error || !isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className={`
        bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Permission Error
            </h3>
            <div className="mt-1 text-sm text-red-700">
              {error}
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className="inline-flex text-red-400 hover:text-red-600 focus:outline-none focus:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorNotification;