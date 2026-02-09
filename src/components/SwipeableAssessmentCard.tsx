import React, { useState, useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

interface SwipeableAssessmentCardProps {
  onDelete: () => void;
  children: React.ReactNode;
}

export function SwipeableAssessmentCard({ onDelete, children }: SwipeableAssessmentCardProps) {
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const DELETE_WIDTH = 88; // Width of delete action area
  const SWIPE_THRESHOLD = 60; // Minimum swipe distance to show delete

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;

    currentXRef.current = e.touches[0].clientX;
    const diff = startXRef.current - currentXRef.current;

    // Only allow left swipe (diff > 0)
    if (diff > 0) {
      const distance = Math.min(diff, DELETE_WIDTH);
      setSwipeDistance(distance);
    } else {
      setSwipeDistance(0);
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);

    if (swipeDistance >= SWIPE_THRESHOLD) {
      // Lock open to show delete button
      setSwipeDistance(DELETE_WIDTH);
      setShowDelete(true);
    } else {
      // Snap back
      setSwipeDistance(0);
      setShowDelete(false);
    }
  };

  const handleDeleteClick = () => {
    onDelete();
    setSwipeDistance(0);
    setShowDelete(false);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
      setSwipeDistance(0);
      setShowDelete(false);
    }
  };

  useEffect(() => {
    if (showDelete) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDelete]);

  return (
    <div 
      ref={cardRef}
      className="relative overflow-hidden"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Delete Action Background */}
      <div 
        className="absolute top-0 right-0 bottom-0 flex items-center justify-end px-4"
        style={{
          width: `${DELETE_WIDTH}px`,
          background: '#D2110C',
          opacity: swipeDistance > 0 ? 1 : 0,
          transition: isSwiping ? 'none' : 'opacity 200ms'
        }}
      >
        <button
          onClick={handleDeleteClick}
          className="flex flex-col items-center justify-center gap-1"
          style={{ 
            opacity: showDelete ? 1 : 0,
            pointerEvents: showDelete ? 'auto' : 'none',
            transition: 'opacity 150ms'
          }}
        >
          <Trash2 className="w-5 h-5" style={{ color: '#FFFFFF' }} />
          <span className="text-xs font-semibold" style={{ color: '#FFFFFF' }}>Delete</span>
        </button>
      </div>

      {/* Card Content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(-${swipeDistance}px)`,
          transition: isSwiping ? 'none' : 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          zIndex: 1
        }}
      >
        {children}
      </div>
    </div>
  );
}
