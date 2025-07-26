import React from "react";

interface IconProps {
  className?: string;
}

const EraserIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5.316 21.316l12.368-12.368a2 2 0 000-2.828L13.856 2.3a2 2 0 00-2.828 0L2.3 11.028a2 2 0 000 2.828l3.016 3.016-4 4.444h4.888l4.444-4z" />
    <path d="M16.684 10.684l-3-3" />
    <path d="M12.144 2.856l8 8" />
  </svg>
);

export default EraserIcon;
