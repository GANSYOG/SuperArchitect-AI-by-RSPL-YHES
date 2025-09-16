import React, { useState, useEffect, useMemo } from 'react';
import type { AgentStatus } from '../types';
import { AgentIcons } from './AgentIcons';
import { TeamMemberIcon } from './icons/TeamMemberIcon';

const AVATAR_STORAGE_KEY = 'superarchitect-avatars';

interface AgentPodProps {
    status: AgentStatus;
    avatarUrl?: string;
}

const AgentPod: React.FC<AgentPodProps> = ({ status, avatarUrl }) => {
    const Icon = AgentIcons[status.agent as keyof typeof AgentIcons] || (() => null);
    const isWorking = status.status === 'working';

    const getStatusIndicator = () => {
        switch (status.status) {
            case 'working':
                return <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" title="Working..."></div>;
            case 'complete':
                return (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 text-green-500"
                    >
                        <title>Complete</title>
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                );
            case 'error':
                 return (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4 text-red-500"
                    >
                        <title>Error</title>
                        <path
                            fillRule="evenodd"
                            d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                            clipRule="evenodd"
                        />
                    </svg>
                 );
            case 'pending':
            default:
                return <div className="w-2.5 h-2.5 rounded-full bg-gray-600" title="Pending"></div>;
        }
    }

    return (
        <div id={`agent-${status.agent.replace(/\s/g, '-')}`} className={`relative p-3 rounded-lg flex flex-col items-center gap-3 transition-all duration-500 transform ${isWorking ? 'bg-amber-900/50 ring-2 ring-amber-500 scale-105' : 'bg-gray-800/50'}`}>
            <div className="flex items-center gap-3 w-full">
                <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg overflow-hidden transition-colors ${isWorking ? 'bg-amber-800/70' : 'bg-gray-700/50'}`}>
                     {avatarUrl ? (
                        <img src={avatarUrl} alt={status.agent} className="w-full h-full object-cover" />
                    ) : (
                        <Icon className="w-6 h-6 text-amber-400" />
                    )}
                </div>
                <div className="flex-grow overflow-hidden">
                    <h4 className="font-bold text-gray-200 truncate text-sm">{status.agent}</h4>
                    <p className="text-xs text-gray-400 truncate">{status.role}</p>
                </div>
                <div className="flex-shrink-0">
                    {getStatusIndicator()}
                </div>
            </div>
            {/* Sub-agents */}
            <div className="flex items-center justify-center gap-1.5 w-full pt-2 border-t border-white/5">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${isWorking ? 'bg-amber-900/80' : 'bg-gray-700/60'}`}>
                        <TeamMemberIcon className={`w-3.5 h-3.5 transition-colors ${isWorking ? 'text-amber-400/80 animate-pulse' : 'text-gray-500'}`} style={{animationDelay: `${i*100}ms`}} />
                    </div>
                ))}
            </div>
             {isWorking && <div className="absolute -inset-px rounded-lg border border-amber-500/50 animate-pulse pointer-events-none"></div>}
        </div>
    );
};


export const AgentHuddle: React.FC<{ statuses: AgentStatus[] }> = ({ statuses }) => {
    const [avatars, setAvatars] = useState<Record<string, string>>({});
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [lines, setLines] = React.useState<any[]>([]);

    useEffect(() => {
        try {
            const storedAvatars = localStorage.getItem(AVATAR_STORAGE_KEY);
            if (storedAvatars) {
                setAvatars(JSON.parse(storedAvatars));
            }
        } catch (e) {
            console.error("Failed to load avatars from localStorage", e);
        }
    }, []);
    
    const lead = statuses.find(s => s.agent === "Project Lead");
    const creativeTeam = statuses.filter(s => ["Concept Architect", "Visual Synthesis AI"].includes(s.agent));
    const supportTeam = statuses.filter(s => ["Materials Specialist", "Compliance AI", "Data Integrator"].includes(s.agent));
    
    const activeAgent = statuses.find(s => s.status === 'working');
    
    useEffect(() => {
        const calculateLines = () => {
            if (!containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();
            
            const getCenter = (id: string) => {
                const el = document.getElementById(id);
                if (!el) return null;
                const rect = el.getBoundingClientRect();
                return {
                    x: rect.left - containerRect.left + rect.width / 2,
                    y: rect.top - containerRect.top + rect.height,
                };
            };
            
            const leadCenter = getCenter('agent-Project-Lead');
            if (!leadCenter) return;
            
            const newLines = [];
            
            const creativeLeadPoint = { x: leadCenter.x - containerRect.width / 4, y: leadCenter.y + 60 };
            newLines.push({ d: `M ${leadCenter.x} ${leadCenter.y} Q ${leadCenter.x} ${leadCenter.y + 40} ${creativeLeadPoint.x} ${creativeLeadPoint.y}`, active: creativeTeam.some(s => s.status === 'working') });

            for (const agent of creativeTeam) {
                const agentCenter = getCenter(`agent-${agent.agent.replace(/\s/g, '-')}`);
                if (agentCenter) {
                    newLines.push({ d: `M ${creativeLeadPoint.x} ${creativeLeadPoint.y} L ${agentCenter.x} ${agentCenter.y - agentCenter.y/4}`, active: agent.status === 'working' });
                }
            }

            const supportLeadPoint = { x: leadCenter.x + containerRect.width / 4, y: leadCenter.y + 60 };
            newLines.push({ d: `M ${leadCenter.x} ${leadCenter.y} Q ${leadCenter.x} ${leadCenter.y + 40} ${supportLeadPoint.x} ${supportLeadPoint.y}`, active: supportTeam.some(s => s.status === 'working') });
            
            for (const agent of supportTeam) {
                const agentCenter = getCenter(`agent-${agent.agent.replace(/\s/g, '-')}`);
                if (agentCenter) {
                    newLines.push({ d: `M ${supportLeadPoint.x} ${supportLeadPoint.y} L ${agentCenter.x} ${agentCenter.y - agentCenter.y/4}`, active: agent.status === 'working' });
                }
            }
            
            setLines(newLines);
        };
        
        // Calculate lines on mount and on window resize
        calculateLines();
        const resizeObserver = new ResizeObserver(calculateLines);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        
        const timeoutId = setTimeout(calculateLines, 50); // Recalculate after initial render animation

        return () => {
             resizeObserver.disconnect();
             clearTimeout(timeoutId);
        }
    }, [statuses]);

    const activeMessage = useMemo(() => {
        return activeAgent?.message || "Awaiting team assignment...";
    }, [activeAgent]);

    return (
        <div className="max-w-6xl w-full mx-auto p-4">
             <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-200 mb-2">AI Command Center Mobilized</h2>
                <p className="text-gray-400">Our specialized agents are collaborating to bring your vision to life.</p>
                 <div className="mt-4 w-full max-w-2xl mx-auto h-12 flex items-center justify-center p-3 bg-gray-900/50 rounded-lg border border-gray-700/60">
                     <p className="text-amber-300 font-mono text-sm truncate" key={activeMessage}>{activeMessage}</p>
                 </div>
            </div>
            <div ref={containerRef} className="relative">
                {/* Project Lead */}
                <div className="flex justify-center mb-16">
                    {lead && <div className="w-full max-w-sm"><AgentPod status={lead} avatarUrl={avatars[lead.agent]} /></div>}
                </div>

                {/* Teams */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16">
                    {/* Creative Team */}
                    <div className="space-y-4 relative">
                        <h3 className="text-center text-lg font-semibold text-amber-400/80 tracking-widest uppercase">Creative Team</h3>
                        {creativeTeam.map(status => (
                            <AgentPod key={status.agent} status={status} avatarUrl={avatars[status.agent]} />
                        ))}
                    </div>
                    {/* Support Team */}
                    <div className="space-y-4 relative">
                         <h3 className="text-center text-lg font-semibold text-amber-400/80 tracking-widest uppercase">Support Team</h3>
                        {supportTeam.map(status => (
                            <AgentPod key={status.agent} status={status} avatarUrl={avatars[status.agent]} />
                        ))}
                    </div>
                </div>

                {/* SVG Communication Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    {lines.map((line, i) => (
                        <path key={i} d={line.d} stroke={line.active ? '#F59E0B' : '#4B5563'} strokeWidth="2" fill="none" strokeDasharray="6 4" className={line.active ? 'line-animation' : ''} />
                    ))}
                </svg>
            </div>
        </div>
    );
};