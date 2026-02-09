import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface UndoToastProps {
  message?: string;
  assessment?: any;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number; // in milliseconds
}

export function UndoToast({ message, assessment, onUndo, onDismiss, duration = 6000 }: UndoToastProps) {
  const [progress, setProgress] = useState(100);
  const displayMessage = message || 'Assessment deleted';

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        onDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onDismiss]);

  const handleUndo = () => {
    onUndo();
    onDismiss();
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[100] px-4 animate-slide-up"
      style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}
    >
      <div 
        className="rounded-xl shadow-2xl overflow-hidden mx-auto"
        style={{ 
          background: '#1A1C22',
          border: '1px solid #242632',
          maxWidth: '480px'
        }}
      >
        {/* Progress Bar */}
        <div 
          className="h-1 transition-all duration-50"
          style={{ 
            width: `${progress}%`,
            background: '#D2110C'
          }}
        />

        {/* Content */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-sm font-medium" style={{ color: '#FFFFFF' }}>
              {displayMessage}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
              style={{ 
                background: '#D2110C',
                color: '#FFFFFF'
              }}
            >
              Undo
            </button>
            <button
              onClick={onDismiss}
              className="p-2 rounded-lg transition-all"
              style={{ color: '#8E91A3' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}