import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Design, MaterialScheduleItem } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { MapIcon } from './icons/MapIcon';
import { downloadUrl, generateAndDownloadPdf } from '../utils/exportUtils';
import { DownloadIcon } from './icons/DownloadIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { HomeIcon } from './icons/HomeIcon';
import { SwatchIcon } from './icons/SwatchIcon';
import { BarChart } from './BarChart';
import { CashIcon } from './icons/CashIcon';
import { HeartPulseIcon } from './icons/HeartPulseIcon';
import { PaintBrushIcon } from './icons/PaintBrushIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { editImage } from '../services/geminiService';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';

interface DesignViewerModalProps {
  design: Design;
  onClose: () => void;
}

type ViewType = 'exterior' | 'interior' | 'plan' | 'finishes' | 'cost' | 'sustainability';

const FinishesTable: React.FC<{ items: MaterialScheduleItem[] | undefined, headers: string[] }> = ({ items, headers }) => (
    <div className="overflow-x-auto rounded-lg border border-gray-800 mb-4">
        <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-300 uppercase bg-gray-800">
                <tr>
                    {headers.map(h => <th key={h} className="px-4 py-2">{h}</th>)}
                </tr>
            </thead>
            <tbody>
                {items?.map((item: any, index) => (
                    <tr key={index} className="bg-gray-800/50 border-b border-gray-800 last:border-0 hover:bg-gray-700/50 transition-colors">
                        {Object.values(item).map((val: any, i) => <td key={i} className="px-4 py-3 font-medium text-gray-200">{val}</td>)}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


export const DesignViewerModal: React.FC<DesignViewerModalProps> = ({ design, onClose }) => {
  const [activeTab, setActiveTab] = useState<ViewType>('exterior');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  
  const [activeExteriorIndex, setActiveExteriorIndex] = useState(0);
  const [activePlanIndex, setActivePlanIndex] = useState(0);
  const [activeInteriorIndex, setActiveInteriorIndex] = useState(0);

  // State for new features
  const [editState, setEditState] = useState<{ [key: string]: {isEditing: boolean, prompt: string, isRevising: boolean, revisedUrl?: string, error?: string} }>({});

  
  // Reset states when design changes
  useEffect(() => {
    setActiveExteriorIndex(0);
    setActivePlanIndex(0);
    setActiveInteriorIndex(0);
    setEditState({});
    
    if (design.exteriorImageUrls?.length > 0) setActiveTab('exterior');
    else if (design.interiorImageUrls?.length > 0) setActiveTab('interior');
    else setActiveTab('plan');
  }, [design]);


  const handleExport = async (format: 'pdf' | 'exterior-jpg' | 'plan-jpg') => {
    setIsExportMenuOpen(false);
    const primaryImageUrl = design.exteriorImageUrls.find(img => img.view.toLowerCase() === 'day')?.url || design.exteriorImageUrls[0]?.url;
    const primaryPlanUrl = design.floorPlanUrls[0]?.url;

    switch (format) {
      case 'pdf': await generateAndDownloadPdf(design); break;
      case 'exterior-jpg': 
        if(primaryImageUrl) downloadUrl(primaryImageUrl, `${design.title}-Exterior-View.jpg`); 
        break;
      case 'plan-jpg': 
        if(primaryPlanUrl) downloadUrl(primaryPlanUrl, `${design.title}-2D-Plan.jpg`); 
        break;
    }
  };

  const handleEditImage = useCallback(async (imageUrl: string, mimeType: string) => {
    const currentState = editState[imageUrl] || { isEditing: true, prompt: '', isRevising: false };
    setEditState(prev => ({...prev, [imageUrl]: {...currentState, isRevising: true, error: undefined, revisedUrl: undefined}}));
    
    try {
        const { imageUrl: newImageUrl } = await editImage(imageUrl, mimeType, currentState.prompt);
        setEditState(prev => ({...prev, [imageUrl]: {...currentState, isRevising: false, revisedUrl: newImageUrl }}));
    } catch (err) {
        setEditState(prev => ({...prev, [imageUrl]: {...currentState, isRevising: false, error: err instanceof Error ? err.message : "Editing failed." }}));
    }
  }, [editState]);


  const renderContent = () => {
    const ImageViewer = (image: {url: string, view: string}, onPrev: (e: React.MouseEvent) => void, onNext: (e: React.MouseEvent) => void, hasMultiple: boolean) => {
        const currentEditState = editState[image.url] || { isEditing: false, prompt: '', isRevising: false };
        const displayUrl = currentEditState.revisedUrl || image.url;

        return (
          <div className="relative w-full h-full group flex flex-col items-center justify-center p-4 bg-black">
              <img src={displayUrl} alt={`${design.title} - ${image.view}`} className="w-full h-full object-contain animate-fadeIn" key={displayUrl} />
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm font-semibold px-4 py-1.5 rounded-full backdrop-blur-sm shadow-lg">{image.view} {currentEditState.revisedUrl && "(Edited)"}</div>
              
              {hasMultiple && (
                  <>
                      <button onClick={onPrev} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100" aria-label="Previous image"><ChevronLeftIcon className="w-6 h-6" /></button>
                      <button onClick={onNext} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100" aria-label="Next image"><ChevronRightIcon className="w-6 h-6" /></button>
                  </>
              )}

              <div className="absolute bottom-4 left-4 right-4 flex flex-col items-center gap-2 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                  {currentEditState.isEditing && (
                      <div className="w-full max-w-2xl bg-gray-900/80 backdrop-blur-sm p-3 rounded-lg border border-gray-700 space-y-2 animate-fadeIn">
                           <textarea value={currentEditState.prompt} onChange={(e) => setEditState(p => ({...p, [image.url]: {...currentEditState, prompt: e.target.value}}))} placeholder="e.g., change the concrete walls to red brick" rows={2} className="w-full bg-gray-800 text-sm border-gray-600 rounded-md focus:ring-amber-500 focus:border-amber-500"></textarea>
                           {currentEditState.error && <p className="text-red-400 text-xs">{currentEditState.error}</p>}
                           <div className="flex gap-2 justify-end">
                               {currentEditState.revisedUrl && <button onClick={() => setEditState(p => ({...p, [image.url]: {...currentEditState, revisedUrl: undefined}}))} className="px-3 py-1 text-xs font-semibold rounded-md bg-gray-600 hover:bg-gray-500 text-white">Revert</button>}
                               <button onClick={() => handleEditImage(image.url, 'image/jpeg')} disabled={currentEditState.isRevising} className="px-3 py-1 text-xs font-semibold rounded-md bg-amber-600 hover:bg-amber-500 text-gray-900 disabled:opacity-50 flex items-center gap-1.5">
                                   {currentEditState.isRevising ? 'Revising...' : 'Revise'}{currentEditState.isRevising && <SparklesIcon className="w-3 h-3 animate-spin"/>}
                               </button>
                           </div>
                      </div>
                  )}
                   <button onClick={() => setEditState(prev => {
                        const current = prev[image.url] || { isEditing: false, prompt: '', isRevising: false };
                        return { ...prev, [image.url]: { ...current, isEditing: !current.isEditing } };
                    })} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 text-gray-900 font-bold backdrop-blur-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-white">
                        <PaintBrushIcon className="w-5 h-5"/> {currentEditState.isEditing ? 'Close Editor' : 'Edit this View'}
                   </button>
              </div>
          </div>
        );
    }
    
    switch (activeTab) {
      case 'exterior':
        if (!design.exteriorImageUrls || design.exteriorImageUrls.length === 0) return <div className="text-gray-500 flex items-center justify-center h-full">No exterior views available.</div>;
        return ImageViewer(design.exteriorImageUrls[activeExteriorIndex],
            (e) => { e.stopPropagation(); setActiveExteriorIndex(p => (p - 1 + design.exteriorImageUrls.length) % design.exteriorImageUrls.length); },
            (e) => { e.stopPropagation(); setActiveExteriorIndex(p => (p + 1) % design.exteriorImageUrls.length); },
            design.exteriorImageUrls.length > 1);

      case 'interior':
        if (!design.interiorImageUrls || design.interiorImageUrls.length === 0) return <div className="text-gray-500 flex items-center justify-center h-full">No interior rooms available.</div>;
         const interiorImage = design.interiorImageUrls[activeInteriorIndex];
         return ImageViewer({ url: interiorImage.url, view: interiorImage.room },
            (e) => { e.stopPropagation(); setActiveInteriorIndex(p => (p - 1 + design.interiorImageUrls.length) % design.interiorImageUrls.length); },
            (e) => { e.stopPropagation(); setActiveInteriorIndex(p => (p + 1) % design.interiorImageUrls.length); },
            design.interiorImageUrls.length > 1);
     
      case 'plan':
        if (!design.floorPlanUrls || design.floorPlanUrls.length === 0) return <div className="text-gray-500 flex items-center justify-center h-full">No 2D plans available.</div>;
        const currentPlan = design.floorPlanUrls[activePlanIndex];
        return <div className="w-full h-full flex flex-col items-center justify-center bg-white">
                {design.floorPlanUrls.length > 1 && <div className="flex-shrink-0 p-2 bg-gray-100 flex justify-center gap-2 border-b border-gray-300 w-full">{design.floorPlanUrls.map((plan, index) => <button key={plan.level} onClick={() => setActivePlanIndex(index)} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${index === activePlanIndex ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>{plan.level}</button>)}</div>}
                <div className="flex-grow w-full p-4 flex items-center justify-center"><img src={currentPlan.url} alt={`2D Plan - ${currentPlan.level}`} className="w-full h-full object-contain" key={currentPlan.url} /></div>
            </div>;

      case 'finishes':
        return <div className="w-full h-full p-6 overflow-y-auto"><h3 className="text-xl font-bold text-amber-500 mb-6">Materials & Finishes Schedule</h3>{Object.entries(design.finishesSchedule).map(([category, items]) => <div key={category} className="mb-6"><h4 className="text-lg font-semibold text-amber-400/90 mb-2 capitalize">{category}</h4><FinishesTable items={items} headers={["Location", "Material", "Finish", "Notes"]} /></div>)}</div>;

      case 'cost':
        if (!design.costAnalysis) return <div className="p-6 text-gray-500 flex items-center justify-center h-full">Cost Analysis is not available.</div>;
        return <div className="w-full h-full p-6 overflow-y-auto">
            <h3 className="text-xl font-bold text-amber-500 mb-2">Cost Analysis</h3>
            <div className="flex justify-between items-baseline mb-6">
                <p className="text-gray-400">Total Estimated Cost:</p>
                <p className="text-3xl font-bold text-amber-400">{new Intl.NumberFormat('en-US', { style: 'currency', currency: design.costAnalysis.currency, maximumFractionDigits: 0 }).format(design.costAnalysis.estimatedTotalCost)}</p>
            </div>
            <div className="space-y-6">
                <div><h4 className="text-lg font-semibold text-amber-400/90 mb-2">Cost Breakdown</h4><BarChart data={design.costAnalysis.costBreakdown.map(d => ({label: d.category, value: d.cost}))} currency={design.costAnalysis.currency} /></div>
                <div><h4 className="text-lg font-semibold text-amber-400/90 mb-2">Bill of Quantities (Sample)</h4><FinishesTable items={design.costAnalysis.billOfQuantities as any} headers={["Item", "Quantity", "Unit"]} /></div>
                <div><h4 className="text-lg font-semibold text-amber-400/90 mb-2">Analyst Summary</h4><p className="text-sm text-gray-400 bg-gray-800/50 p-4 rounded-lg">{design.costAnalysis.summary}</p></div>
            </div>
        </div>;

      case 'sustainability':
        if (!design.sustainabilityReport) return <div className="p-6 text-gray-500 flex items-center justify-center h-full">Sustainability Report is not available.</div>;
        const { overallScore, summary, positiveAspects, improvementSuggestions } = design.sustainabilityReport;
        return <div className="w-full h-full p-6 overflow-y-auto space-y-6">
            <h3 className="text-xl font-bold text-amber-500 mb-2">Sustainability & Eco-Analysis</h3>
            <div className="flex items-center gap-6 bg-gray-800/50 p-4 rounded-lg">
                <div className="relative w-24 h-24"><svg className="w-full h-full" viewBox="0 0 36 36"><path className="text-gray-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" /><path className="text-amber-500" strokeDasharray={`${overallScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-bold text-white">{overallScore}</span><span className="text-xs text-gray-400">/ 100</span></div></div>
                <div><h4 className="text-lg font-semibold text-amber-400/90">Eco-Score</h4><p className="text-sm text-gray-400 mt-1">{summary}</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><h4 className="text-lg font-semibold text-green-400/90 mb-2">Positive Aspects</h4><ul className="list-disc list-inside space-y-1 text-sm text-gray-300">{positiveAspects.map((a, i) => <li key={i}>{a}</li>)}</ul></div>
                <div><h4 className="text-lg font-semibold text-yellow-400/90 mb-2">Improvement Suggestions</h4><ul className="list-disc list-inside space-y-1 text-sm text-gray-300">{improvementSuggestions.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
            </div>
        </div>;
    
      default: return null;
    }
  };

  const NavButton: React.FC<{ tab: ViewType, icon: React.FC<any>, label: string, disabled?: boolean }> = ({ tab, icon: Icon, label, disabled }) => (
    <button onClick={() => !disabled && setActiveTab(tab)} disabled={disabled} className={`flex items-center gap-3 w-full p-3 rounded-md text-left transition-colors ${activeTab === tab ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <Icon className="w-6 h-6" />
      <span className="font-semibold">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <div className="relative w-full h-full bg-gray-950 rounded-lg shadow-2xl flex border border-gray-700 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <aside className="w-72 bg-gray-900 p-4 flex flex-col border-r border-gray-800 overflow-y-auto">
            <h2 className="text-xl font-bold text-amber-400 truncate mb-2" title={design.title}>{design.title}</h2>
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-4 mb-4">{design.description}</p>
            
            <div className="mb-4 p-3 rounded-lg bg-gray-800/50 border border-gray-700/60">
                <h4 className="font-semibold text-gray-400 text-xs uppercase tracking-wider mb-2">Specifications</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-300">
                    {design.dimensions && (<><span className="text-gray-400">Area:</span><span className="font-semibold text-right">{`${design.dimensions.length}x${design.dimensions.width} ${design.dimensions.unit}`}</span></>)}
                    {design.flatConfiguration && (<><span className="text-gray-400">Layout:</span><span className="font-semibold text-right">{design.flatConfiguration.bhk} BHK</span><span className="text-gray-400">Bathrooms:</span><span className="font-semibold text-right">{design.flatConfiguration.numBathrooms}</span><span className="text-gray-400">Balconies:</span><span className="font-semibold text-right">{design.flatConfiguration.numBalconies}</span></>)}
                </div>
            </div>

            <nav className="space-y-2">
              <h3 className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Views</h3>
              <NavButton tab="exterior" icon={PhotoIcon} label="Exterior Views" />
              <NavButton tab="interior" icon={HomeIcon} label="Interior Rooms" disabled={!design.interiorImageUrls || design.interiorImageUrls.length === 0} />
              <NavButton tab="plan" icon={MapIcon} label="2D Plans" />
              <h3 className="px-3 pt-4 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Analysis</h3>
              <NavButton tab="finishes" icon={SwatchIcon} label="Finishes Schedule" />
              <NavButton tab="cost" icon={CashIcon} label="Cost Analysis" disabled={!design.costAnalysis} />
              <NavButton tab="sustainability" icon={HeartPulseIcon} label="Sustainability" disabled={!design.sustainabilityReport} />
            </nav>

             {design.complianceNotes && <div className="mt-4 pt-4 border-t border-gray-800/60"><div className="p-3 rounded-lg bg-gray-800/50"><div className="flex items-center gap-2 mb-1"><ShieldCheckIcon className="w-5 h-5 text-amber-500 flex-shrink-0" /><h4 className="font-semibold text-gray-300 text-sm">Compliance Note</h4></div><p className="text-xs text-gray-400">{design.complianceNotes}</p></div></div>}
            
            <div className="mt-auto pt-4">
                <div className="relative" ref={exportMenuRef}>
                    <button type="button" onClick={() => setIsExportMenuOpen(p=>!p)} className="w-full flex items-center justify-center gap-2 p-3 rounded-md text-white font-semibold bg-amber-600 hover:bg-amber-700 transition-colors"><DownloadIcon className="w-5 h-5"/> Export Package</button>
                    {isExportMenuOpen && <div className="absolute bottom-full left-0 mb-2 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg z-20 animate-fadeIn"><ul className="py-1 text-sm text-gray-300"><li><button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2 font-semibold hover:bg-amber-500 hover:text-gray-900 rounded-t-md">Project PDF</button></li><li><button onClick={() => handleExport('exterior-jpg')} className="w-full text-left px-4 py-2 hover:bg-amber-500 hover:text-gray-900">Primary Exterior (.jpg)</button></li><li><button onClick={() => handleExport('plan-jpg')} className="w-full text-left px-4 py-2 hover:bg-amber-500 hover:text-gray-900 rounded-b-md">Primary Plan (.jpg)</button></li></ul></div>}
                </div>
            </div>
        </aside>

        <main className="flex-1 bg-gray-950 flex items-center justify-center overflow-hidden">
          <div className="w-full h-full animate-fadeIn" key={activeTab}>
            {renderContent()}
          </div>
        </main>

        <button type="button" onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-black/30 hover:bg-black/50 z-30" aria-label="Close viewer"><CloseIcon className="w-6 h-6" /></button>
      </div>
       <style>{`
        .animate-fadeIn { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        .line-clamp-4 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 4; }
       `}</style>
    </div>
  );
};