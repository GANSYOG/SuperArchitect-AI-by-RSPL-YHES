import React from 'react';

export const HeartPulseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
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
      <path d="M19.5 12.572l-1.428 1.428a4 4 0 0 1-5.656 0L12 13.572l-.416.416a4 4 0 0 1-5.656 0L4.5 12.572" />
      <path d="M2 12h2l3 9 4-18 3 9h10" />
      <path d="M12 8.428a4 4 0 0 1 5.656 0L19.5 10" />
    </svg>
  );
};
