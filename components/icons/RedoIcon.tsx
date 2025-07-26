import React from "react";

interface IconProps {
  className?: string;
}

const RedoIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 13h16" />
    <path d="M15 9l4 4-4 4" />
    <path d="M20.5 8.5c-1.5-3.3-5.2-5.5-9.5-5.5a9 9 0 00-8.1 5" />
  </svg>
);

export default RedoIcon;
