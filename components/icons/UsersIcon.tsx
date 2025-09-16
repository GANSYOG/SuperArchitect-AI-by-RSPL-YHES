import React from 'react';

export const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M10.5 6a.75.75 0 00-1.5 0v2.25H6.75a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25h2.25a.75.75 0 000-1.5H10.5V6z" />
      <path fillRule="evenodd" d="M6 3a3 3 0 00-3 3v12a3 3 0 003 3h12a3 3 0 003-3V6a3 3 0 00-3-3H6zm1.5 15a.75.75 0 000-1.5H6a.75.75 0 00-.75.75v.75c0 .414.336.75.75.75h1.5v-.75zm.75-3.75a.75.75 0 00-1.5 0v2.25a.75.75 0 001.5 0V15zm-3 3.75a.75.75 0 000-1.5H3.75a.75.75 0 000 1.5h1.5zM9 18.75a.75.75 0 00-1.5 0v.75a.75.75 0 001.5 0v-.75zm3.75-1.5a.75.75 0 000-1.5h-2.25a.75.75 0 000 1.5h2.25zM15 15.75a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V15.75zM15.75 9a.75.75 0 00-1.5 0v2.25a.75.75 0 001.5 0V9zm-3.75-1.5A.75.75 0 0010.5 9v2.25a.75.75 0 001.5 0V9a.75.75 0 00-1.5 0z" clipRule="evenodd" />
    </svg>
  );
};