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
import { SuperhumanDesigner } from './components/SuperhumanDesigner';
import { HomeModernIcon } from './components/icons/HomeModernIcon';
import { PaintBrushIcon } from './components/icons/PaintBrushIcon';
import { UserCircleIcon } from './components/icons/UserCircleIcon';
import { LightBulbIcon } from './components/icons/LightBulbIcon';
import { UsersIcon } from './components/icons/UsersIcon';

const App: React.FC = () => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>(SAAI_AGENTS.map(agent => ({ ...agent, status: 'pending', message: 'Awaiting Brief' })));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [view, setView] = useState<View>('architecture');
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerateDesigns = useCallback(async (brief: ProjectBrief) => {
    setView('architecture');
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
      return <AgentHuddle statuses={agentStatuses} />;
    }
    if (error) {
      return (
        <div className="max-w-2xl mx-auto bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center mt-10">
          <h3 className="font-bold">Generation Failed</h3>
          <p>{error}</p>
        </div>
      );
    }
    if (designs.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-fadeIn">
          {designs.map((design, index) => (
            <DesignCard key={index} design={design} onSelect={() => setSelectedDesign(design)} />
          ))}
        </div>
      );
    }
    // Show input form if nothing has been generated yet
    return <InputForm onSubmit={handleGenerateDesigns} isLoading={isLoading} />;
  };

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
        return renderArchitectureStudio(); // Default to architecture
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark text-gray-200 font-sans">
      <Header currentView={view} setView={setView} />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {renderMainContent()}
      </main>
      
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
