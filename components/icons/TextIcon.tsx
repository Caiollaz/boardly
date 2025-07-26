
import React from 'react';

interface IconProps {
    className?: string;
}

const TextIcon: React.FC<IconProps> = ({ className }) => (
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
        <path d="M17 6.5v11.5" />
        <path d="M7 6.5v11.5" />
        <path d="M7 12h10" />
    </svg>
);

export default TextIcon;