import React from 'react';

export const CubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21 7.5l-9-5.25L3 7.5v9l9 5.25 9-5.25v-9zM12 2.25L20.25 7.5 12 12.75 3.75 7.5 12 2.25zM4.5 9.3l7.5 4.35v8.6l-7.5-4.32V9.3zm15 0v8.63l-7.5 4.32v-8.6l7.5-4.35z" />
    </svg>
  );
};
