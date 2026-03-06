import React from 'react';

const Hand = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
    <path d="M12 6v6l4 2" />
    <path d="M16.88 15.12a4 4 0 0 1-5.76 0" />
    <path d="M12 22a8 8 0 0 0 8-8" />
  </svg>
);

export default Hand;
