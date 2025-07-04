import React from 'react';

export const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`animate-spin ${className}`}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export const ErrorIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
        <path d="M12 9v4"></path>
        <path d="M12 16v.01"></path>
    </svg>
);

export const BookOpenIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
       <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
       <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0"></path>
       <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0"></path>
       <path d="M3 6l0 13"></path>
       <path d="M12 6l0 13"></path>
       <path d="M21 6l0 13"></path>
    </svg>
);

export const GlobeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
       <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
       <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
       <path d="M3.6 9l16.8 0"></path>
       <path d="M3.6 15l16.8 0"></path>
       <path d="M11.5 3a17 17 0 0 0 0 18"></path>
       <path d="M12.5 3a17 17 0 0 1 0 18"></path>
    </svg>
);

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,2A3,3,0,0,0,9,5A3,3,0,0,0,12,8A3,3,0,0,0,15,5A3,3,0,0,0,12,2M5,9A3,3,0,0,0,2,12A3,3,0,0,0,5,15A3,3,0,0,0,8,12A3,3,0,0,0,5,9M19,9A3,3,0,0,0,16,12A3,3,0,0,0,19,15A3,3,0,0,0,22,12A3,3,0,0,0,19,9M12,16A3,3,0,0,0,9,19A3,3,0,0,0,12,22A3,3,0,0,0,15,19A3,3,0,0,0,12,16Z" />
    </svg>
);

export const ApprenticeAvatarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
    <path d="M12 5c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3zm0 4c-.551 0-1-.449-1-1s.449-1 1-1 1 .449 1 1-.449 1-1 1z" />
    <path d="M12 13c-2.481 0-4.5 2.019-4.5 4.5V18h9v-.5c0-2.481-2.019-4.5-4.5-4.5zm0 3c.827 0 1.5.673 1.5 1.5V18h-3v-.5c0-.827.673-1.5 1.5-1.5z" />
    <circle cx="16.5" cy="12.5" r="1.5" />
    <circle cx="7.5" cy="12.5" r="1.5" />
  </svg>
);

export const LightbulbIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
       <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
       <path d="M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3"></path>
       <path d="M9.7 17l4.6 0"></path>
    </svg>
);

export const NewspaperIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
       <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
       <path d="M16 6h3a1 1 0 0 1 1 1v11a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a1 1 0 0 1 1 -1h3"></path>
       <path d="M16 3l-4 4l-4 -4"></path>
       <line x1="12" y1="12" x2="12" y2="16"></line>
       <line x1="16" y1="12" x2="16" y2="16"></line>
       <line x1="8" y1="12" x2="8" y2="16"></line>
    </svg>
);

export const PointerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
       <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
       <path d="M8 13v-8.5a1.5 1.5 0 0 1 3 0v7.5"></path>
       <path d="M11 11.5v-2a1.5 1.5 0 0 1 3 0v2.5"></path>
       <path d="M14 10.5a1.5 1.5 0 0 1 3 0v1.5"></path>
       <path d="M17 11.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7l-.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.47 1.47"></path>
    </svg>
);

export const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
       <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
       <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"></path>
       <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"></path>
    </svg>
);

export const ExternalLinkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
       <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
       <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path>
       <path d="M11 13l9 -9"></path>
       <path d="M15 4h5v5"></path>
    </svg>
);