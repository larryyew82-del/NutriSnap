const LeafIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className}
        viewBox="0 0 24 24" 
        fill="currentColor">
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.98.3 1.5.38C8.6 19.61 9 19.05 9 18c0-1.8-1.03-3.22-3-5l.5-1c.98-1.95 2.55-3.26 4.5-4C13.6 7.2 17 8 17 8z"></path>
        <path d="M17 8c-3-2-5-6-5-6s-1 2-2.33 4.16C8.25 7.42 7.29 8.27 6.47 9.24A6.33 6.33 0 0 0 5 13c0 1.65 1.35 3 3 3c.9 0 1.65-.41 2.17-1.03c.51.52 1.25.86 2.06.96c.22.02.44.04.67.04c2.76 0 5-2.24 5-5c0-2.07-1.25-3.84-3-4.61z"></path>
    </svg>
);

export default LeafIcon;