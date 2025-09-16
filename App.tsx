import React, { useState, useCallback, ReactNode } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { DesignCard } from './components/DesignCard';
import { AgentHuddle } from './components/AgentHuddle';
import { AIAssistant } from './components/AIAssistant';
import type { Design, ProjectBrief, AgentStatus, View } from './types';
import { generateDesigns, SAAI_AGENTS } from './services/geminiService';
import { DesignViewerModal } from './components/DesignViewerModal';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { PromptHub } from './components/PromptHub';
import { AgentDesigner } from './components/AgentDesigner';
import { InteriorRevamp } from './components/InteriorRevamp';
import { HomeModernIcon } from './components/icons/HomeModernIcon';
import { PaintBrushIcon } from './components/icons/PaintBrushIcon';
import { UsersIcon } from './components/icons/UsersIcon';
import { LightBulbIcon } from './components/icons/LightBulbIcon';
import { SuperhumanDesigner } from './components/SuperhumanDesigner';
import { UserCircleIcon } from './components/icons/UserCircleIcon';

const App: React.FC = () => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>(SAAI_AGENTS.map(agent => ({ ...agent, status: 'pending', message: 'Awaiting Brief' })));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [view, setView] = useState<View>('architecture');

  const handleGenerateDesigns = useCallback(async (brief: ProjectBrief) => {
    setView('architecture'); // Switch to architecture studio to show progress
    setIsLoading(true);
    setHasGenerated(true);
    setError(null);
    setDesigns([]);
    setAgentStatuses(SAAI_AGENTS.map(agent => ({ ...agent, status: 'pending', message: 'Awaiting Brief' })));

    const updateStatusCallback = (statusUpdate: { agentName: string; status: 'working' | 'complete' | 'error'; message: string; }) => {
        setAgentStatuses(prevStatuses => 
            prevStatuses.map(agent => 
                agent.agent === statusUpdate.agentName 
                ? { ...agent, status: statusUpdate.status, message: statusUpdate.message }
                : agent
            )
        );
    };

    try {
      const generatedDesigns = await generateDesigns(brief, updateStatusCallback);
      setDesigns(generatedDesigns);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred. Please check the console and try again.';
      setError(errorMessage);
       setAgentStatuses(prev => prev.map(s => s.status === 'working' ? {...s, status: 'error', message: 'Failed'} : s));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const renderArchitectureStudio = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full animate-fadeIn">
          <AgentHuddle statuses={agentStatuses} />
        </div>
      );
    }

    if (error) {
      return (
        <div className="max-w-2xl mx-auto bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center mt-10">
          <h3 className="font-bold">Generation Failed</h3>
          <p>{error}</p>
        </div>
      );
    }

    if (hasGenerated && designs.length > 0) {
        return (
            <div className="flex justify-center items-start animate-fadeIn">
                <div className="w-full max-w-xl">
                    {designs.map((design, index) => (
                        <DesignCard key={index} design={design} onSelect={() => setSelectedDesign(design)} />
                    ))}
                </div>
            </div>
        );
    }
    
    // Welcome / Initial State for Architecture Studio
    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center animate-fadeIn">
            <div className="relative mb-6">
                <div className="absolute -inset-2 bg-amber-500/10 rounded-full blur-2xl"></div>
                <SparklesIcon className="relative w-24 h-24 text-amber-500/80"/>
            </div>
            <h2 className="text-3xl font-bold text-gray-200">Welcome to the Architecture Studio</h2>
            <p className="text-gray-400 mt-2 max-w-lg">
                Use the panel on the left to create a detailed brief. Our AI team will then generate a complete architectural concept for you.
            </p>
        </div>
    );
  }

  const renderMainContent = () => {
    switch (view) {
      case 'architecture':
        return renderArchitectureStudio();
      case 'interior':
        return <InteriorRevamp />;
      case 'designer':
        return <SuperhumanDesigner />;
      case 'agents':
        return <AgentDesigner />;
      case 'inspiration':
        return <PromptHub />;
      default:
        return null;
    }
  }

  const NavItem: React.FC<{
    label: string;
    viewName: View;
    icon: React.FC<any>;
  }> = ({ label, viewName, icon: Icon }) => (
    <button
      onClick={() => setView(viewName)}
      className={`flex items-center gap-3 w-full p-3 rounded-lg text-left transition-all duration-200 ${view === viewName ? 'bg-amber-600/20 text-amber-300' : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'}`}
    >
      <Icon className="w-6 h-6 flex-shrink-0" />
      <span className="font-semibold">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans">
      <Header />
      <div className="flex flex-row items-start">
        {/* New Persistent Sidebar */}
        <aside className="w-[480px] h-[calc(100vh-80px)] sticky top-[80px] flex flex-row">
            <nav className="w-64 p-4 bg-gray-950/40 border-r border-gray-800/70 flex flex-col gap-2">
                <h2 className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Studios</h2>
                <NavItem label="Architecture" viewName="architecture" icon={HomeModernIcon} />
                <NavItem label="Interior Revamp" viewName="interior" icon={PaintBrushIcon} />
                <NavItem label="Inspiration Hub" viewName="inspiration" icon={LightBulbIcon} />

                <h2 className="px-3 pt-4 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Agents</h2>
                <NavItem label="Superhuman Designer" viewName="designer" icon={UserCircleIcon} />
                <NavItem label="Agent Team Designer" viewName="agents" icon={UsersIcon} />
            </nav>
            {/* The Input Form is now contextually part of the main architecture flow */}
             <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6">
                <InputForm 
                    onSubmit={handleGenerateDesigns} 
                    isLoading={isLoading} 
                />
            </div>
        </aside>

        <main className="flex-1 p-8 md:p-12 overflow-y-auto h-[calc(100vh-80px)]">
            {renderMainContent()}
        </main>
      </div>
      
      <AIAssistant />
      {selectedDesign && (
        <DesignViewerModal 
          design={selectedDesign}
          onClose={() => setSelectedDesign(null)}
        />
      )}
    </div>
  );
};

export default App;