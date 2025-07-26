import React from "react";

interface IconProps {
  className?: string;
}

const ArrowIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path transform="rotate(45 12 12)" d="M4 11h10v-4l6 5-6 5v-4H4v-2z" />
  </svg>
);

export default ArrowIcon;
