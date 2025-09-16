import React from 'react';

export const ArrowsExpandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
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
        {...props}
    >
        <path d="M4 20h4v-4" />
        <path d="M4 4h4v4" />
        <path d="M20 4h-4v4" />
        <path d="M20 20h-4v-4" />
        <path d="M8 12H4" />
        <path d="M12 4V8" />
        <path d="M16 12h4" />
        <path d="M12 20v-4" />
    </svg>
  );
};