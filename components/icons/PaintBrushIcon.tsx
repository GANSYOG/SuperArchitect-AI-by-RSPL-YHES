import React from 'react';

export const PaintBrushIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
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
        <path d="M18.2 3a.2.2 0 0 0-.2.2v3.3c0 .1-.1.2-.2.2l-3.2 3.2c-.1.1-.1.2 0 .4l1.8 1.8c.1.1.2.1.4 0l3.2-3.2c.1-.1.2-.1.2-.2V3.2c.1-.1.1-.2 0-.2Z" />
        <path d="m14 7-4.5 4.5a1 1 0 0 0 0 1.4l3 3a1 1 0 0 0 1.4 0L18 11" />
        <path d="M12 21h8" />
        <path d="M4 11a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    </svg>
  );
};
