import React, { useState, useEffect } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { SAAI_AGENTS } from '../services/geminiService';
import { generateAgentAvatar } from '../services/geminiService';
import { AgentIcons } from './AgentIcons';

const AVATAR_STORAGE_KEY = 'superarchitect-avatars';

const defaultPrompts: Record<string, string> = {
    "Project Lead": "Portrait of a wise and commanding AI project manager, holographic interface, glowing neural pathways on a sleek chrome chassis, minimalist, vector art.",
    "Concept Architect": "Portrait of a visionary AI architect, creating structures from light, abstract geometric thoughts swirling around, dreamy, ethereal, minimalist, vector art.",
    "Visual Synthesis AI": "Portrait of a powerful AI that dreams in images, converting abstract data into photorealistic renders and precise blueprints, an eye made of light and grids, minimalist, vector art.",
    "Materials Specialist": "Portrait of a detail-oriented AI with a deep knowledge of textures and materials, surrounded by holographic swatches of wood, stone, and metal, minimalist, vector art.",
    "Compliance AI": "Portrait of a guardian AI, holding a glowing shield of regulations, trustworthy, secure, authoritative, minimalist, vector art.",
    "Data Integrator": "Portrait of a central AI hub, connecting various data threads into a cohesive whole, intricate network patterns, balanced, harmonious, minimalist, vector art."
};

interface AgentAvatarCardProps {
    agent: { agent: string; role: string };
    avatarUrl: string | null;
    onAvatarUpdate: (agentName: string, url: string) => void;
}

const AgentAvatarCard: React.FC<AgentAvatarCardProps> = ({ agent, avatarUrl, onAvatarUpdate }) => {
    const [prompt, setPrompt] = useState(defaultPrompts[agent.agent] || `Portrait of a futuristic AI specializing in ${agent.role}, minimalist, vector art.`);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const FallbackIcon = AgentIcons[agent.agent as keyof typeof AgentIcons] || (() => null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const newAvatarUrl = await generateAgentAvatar(prompt);
            onAvatarUpdate(agent.agent, newAvatarUrl);
        } catch (err) {
            console.error(`Failed to generate avatar for ${agent.agent}:`, err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-800/50 border border-gray-700/80 rounded-lg p-6 flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-shrink-0 flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full bg-gray-900 flex items-center justify-center overflow-hidden border-2 border-gray-700">
                    {isLoading ? (
                        <div className="w-12 h-12 border-4 border-t-transparent border-amber-500 rounded-full animate-spin"></div>
                    ) : avatarUrl ? (
                        <img src={avatarUrl} alt={`${agent.agent} Avatar`} className="w-full h-full object-cover" />
                    ) : (
                        <FallbackIcon className="w-16 h-16 text-amber-400/50" />
                    )}
                </div>
                <h3 className="text-lg font-bold text-amber-400">{agent.agent}</h3>
                <p className="text-sm text-gray-500 -mt-3">{agent.role}</p>
            </div>
            <div className="flex-grow w-full">
                <label htmlFor={`prompt-${agent.agent}`} className="block text-sm font-medium text-gray-400 mb-1">Avatar Prompt</label>
                <textarea
                    id={`prompt-${agent.agent}`}
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                    placeholder="Describe the AI's appearance..."
                />
                 {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-gray-900 bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? 'Generating...' : 'Generate Avatar'}
                    <SparklesIcon className={`ml-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>
        </div>
    );
};

export const AgentDesigner: React.FC = () => {
    const [avatars, setAvatars] = useState<Record<string, string>>({});

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

    const handleAvatarUpdate = (agentName: string, url: string) => {
        setAvatars(prev => {
            const newAvatars = { ...prev, [agentName]: url };
            try {
                localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(newAvatars));
            } catch(e) {
                console.error("Failed to save avatars to localStorage", e);
            }
            return newAvatars;
        });
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-4 md:p-8 animate-fadeIn">
            <header className="flex items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-100">Agent Team Designer</h1>
                    <p className="text-gray-400 mt-1">Customize the visual identity of your AI agent team.</p>
                </div>
            </header>
            
            <div className="space-y-8">
                {SAAI_AGENTS.map(agent => (
                    <AgentAvatarCard
                        key={agent.agent}
                        agent={agent}
                        avatarUrl={avatars[agent.agent] || null}
                        onAvatarUpdate={handleAvatarUpdate}
                    />
                ))}
            </div>
        </div>
    );
};