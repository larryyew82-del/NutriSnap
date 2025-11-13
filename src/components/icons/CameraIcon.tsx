import React from 'react';

const CameraIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-2 4h4v-1.09c-1.21-.57-2.79-.57-4 0V16zm10-5c0-1.1-.9-2-2-2h-1.17l-1-1H9.17l-1 1H7c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-8zM12 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm6 5H6v10h12V9z" />
  </svg>
);

export default CameraIcon;
