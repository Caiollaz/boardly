import React from "react";

interface IconProps {
  className?: string;
}

const DiagramIcon: React.FC<IconProps> = ({ className }) => (
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
    <path d="M10 16l-4-4 4-4" />
    <path d="M14 8l4 4-4 4" />
    <path d="M6 12h12" />
  </svg>
);

export default DiagramIcon;
