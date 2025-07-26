
import React from 'react';

interface IconProps {
    className?: string;
}

const UndoIcon: React.FC<IconProps> = ({ className }) => (
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
        <path d="M21 13H5" />
        <path d="M9 9l-4 4 4 4" />
        <path d="M3.5 8.5C5 5.2 8.7 3 13 3a9 9 0 018.1 5" />
    </svg>
);

export default UndoIcon;