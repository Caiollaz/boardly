import React from "react";

interface IconProps {
  className?: string;
}

const LaserPointerIcon: React.FC<IconProps> = ({ className }) => (
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
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    <path d="m12 12-1-1 4-4" />
    <path d="m15 15-4.5 4.5" />
    <path d="m13 7 1-1" />
    <path d="m9 17 2 2" />
  </svg>
);

export default LaserPointerIcon;
