
import React from 'react';

interface IconProps {
    className?: string;
}

const LineIcon: React.FC<IconProps> = ({ className }) => (
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
        <line x1="5" y1="19" x2="19" y2="5"></line>
    </svg>
);

export default LineIcon;
