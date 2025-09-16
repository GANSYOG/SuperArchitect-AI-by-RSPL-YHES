import React from 'react';
import { SwatchIcon } from './icons/SwatchIcon';
import { CashIcon } from './icons/CashIcon';
import { HeartPulseIcon } from './icons/HeartPulseIcon';
import { CubeIcon } from './icons/CubeIcon';

const OrionIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( // Project Lead
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
);

const AriaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( // Creative Architect
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0L12 2.69z" />
        <path d="M12 12l-2 2" />
        <path d="M12 17v5" />
        <path d="M12 12l2-2" />
    </svg>
);

const VisualSynthesisIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( // Visual Synthesis AI
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 18v-2" />
        <path d="M12 8V6" />
        <path d="M17 15l-2-2" />
        <path d="M7 9l2 2" />
        <path d="M20 12h-2" />
        <path d="M6 12H4" />
    </svg>
);

const LexIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( // Compliance Officer
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
    </svg>
);

const IrisIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( // Integration Unit
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <path d="M3.27 6.96L12 12.01l8.73-5.05" />
        <path d="M12 22.08V12" />
    </svg>
);

export const AgentIcons = {
    "Project Lead": OrionIcon,
    "Concept Architect": AriaIcon,
    "Visual Synthesis AI": VisualSynthesisIcon,
    "Materials Specialist": SwatchIcon,
    "Cost Estimator AI": CashIcon,
    "Eco-Analyst AI": HeartPulseIcon,
    "Compliance AI": LexIcon,
    "Data Integrator": IrisIcon,
};