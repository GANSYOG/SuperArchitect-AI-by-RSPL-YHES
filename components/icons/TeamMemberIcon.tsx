import React from 'react';

export const TeamMemberIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        {...props}
    >
        <path fillRule="evenodd" d="M8 9a4 4 0 100-8 4 4 0 000 8zM15.5 8.25a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75zM16.25 12a.75.75 0 00-.75.75v4.5a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75zM3.5 14.5a2.5 2.5 0 00-2.5 2.5v2.5a.75.75 0 001.5 0V17a1 1 0 011-1h5a1 1 0 011 1v2.5a.75.75 0 001.5 0V17a2.5 2.5 0 00-2.5-2.5h-5z" clipRule="evenodd" />
    </svg>
  );
};
