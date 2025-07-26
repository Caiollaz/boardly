
import React from 'react';

interface IconProps {
    className?: string;
}

const MagicIcon: React.FC<IconProps> = ({ className }) => (
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
        className={className}
    >
        <path d="M9.75 3.1c.3.3.3.8 0 1.1L5.3 8.65l3.55 3.55a.75.75 0 0 1 0 1.06l-4.6 4.6a.75.75 0 0 1-1.06 0L.3 14.9a.75.75 0 0 1 0-1.06l4.6-4.6a.75.75 0 0 1 1.06 0l3.79 3.8 4.45-4.45a.75.75 0 0 1 1.06 0l3.55 3.55 1.4-1.4-3.55-3.55a.75.75 0 0 1 0-1.06l4.6-4.6a.75.75 0 0 1 1.06 0l2.85 2.85a.75.75 0 0 1 0 1.06l-4.6 4.6a.75.75 0 0 1-1.06 0L14.35 5.3l-4.6-4.6a.75.75 0 0 1-1.06-1.06.75.75 0 0 1 1.06 0z"/>
        <path d="m14.5 19.5 2-2" />
        <path d="m20.5 13.5 2-2" />
        <path d="m5 5 2-2" />
        <path d="m11 11 2-2" />
    </svg>
);

export default MagicIcon;