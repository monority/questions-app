import React, { memo } from 'react';

interface LoadingProgressProps {
  progress: number;
  message?: string;
}

export const LoadingProgress = memo(function LoadingProgress({ progress, message }: LoadingProgressProps) {
  return (
    <div className="loading-progress-container">
      <div className="loading-progress-bar">
        <div 
          className="loading-progress-fill" 
          style={{ '--progress': `${progress}%` } as React.CSSProperties}
        />
      </div>
      {message && <p className="loading-message">{message}</p>}
      {progress < 100 && <div className="loading-spinner-small" />}
    </div>
  );
});

interface SkeletonProps {
  className?: string;
}

export const Skeleton = memo(function Skeleton({ className }: SkeletonProps) {
  return <div className={`skeleton ${className || ''}`} />;
});

interface CelebrationProps {
  isActive: boolean;
  children: React.ReactNode;
}

export const Celebration = memo(function Celebration({ isActive, children }: CelebrationProps) {
  return (
    <div className={`celebration-container ${isActive ? 'animate-celebrate' : ''}`}>
      {isActive && (
        <div className="confetti-container">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i} 
              className="confetti"
              style={{
                '--confetti-color': ['#fbbf24', '#ef4444', '#10b981', '#6366f1', '#ec4899'][i % 5],
                '--confetti-delay': `${i * 50}ms`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}
      {children}
    </div>
  );
});