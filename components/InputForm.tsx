import React, { useState, ReactNode, useEffect } from 'react';
import type { ProjectBrief } from '../types';
import { DimensionUnit } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { BuildingOfficeIcon } from './icons/BuildingOfficeIcon';
import { HomeIcon } from './icons/HomeIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { CubeIcon } from './icons/CubeIcon';
import { AdjustmentsHorizontalIcon } from './icons/AdjustmentsHorizontalIcon';
import { PaletteIcon } from './icons/PaletteIcon';
import { architecturalStyles, materialsLibrary, designFeatures } from '../services/designLibrary';

// Accordion Component
const AccordionSection: React.FC<{
  title: string;
  icon: React.FC<any>;
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ title, icon: Icon, children, isOpen, onToggle }) => (
  <div className="border-b border-brand-border/60" data-state={isOpen ? 'open' : 'closed'}>
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-between w-full p-5 text-left hover:bg-white/5 transition-colors"
      aria-expanded={isOpen}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-6 h-6 text-brand-amber-400" />
        <span className="text-lg font-semibold text-gray-200">{title}</span>
      </div>
      <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    <div className="overflow-hidden">
        <div className="p-5 pt-0 space-y-6">{children}</div>
    </div>
  </div>
);

interface InputFormProps {
  onSubmit: (brief: ProjectBrief) => void;
  isLoading: boolean;
}

const spaceConfigurations = {
  Residential: { icon: HomeIcon, subSpaces: ['Row (house)', 'Bungalow', 'Flat', 'Penthouse', 'Duplex', 'Farmhouse'] },
  Commercial: { icon: BuildingOfficeIcon, subSpaces: ['Offices', 'Sample flat', 'Showroom', 'Retail Store'] },
};

type SpaceType = keyof typeof spaceConfigurations;

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [openSection, setOpenSection] = useState('details');

  const [projectName, setProjectName] = useState('My New Project');
  const [length, setLength] = useState<number | string>(40);
  const [width, setWidth] = useState<number | string>(30);
  const [height, setHeight] = useState<number | string>(10);
  const [unit, setUnit] = useState<DimensionUnit>(DimensionUnit.FEET);
  const [activeSpaceType, setActiveSpaceType] = useState<SpaceType>('Residential');
  const [selectedSubSpaces, setSelectedSubSpaces] = useState<string[]>([]);
  const [bhk, setBhk] = useState<number>(2);
  const [numBathrooms, setNumBathrooms] = useState<number | string>(2);
  const [numBalconies, setNumBalconies] = useState<number | string>(1);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [structuralConstraints, setStructuralConstraints] = useState<string>('');
  const [location, setLocation] = useState('New York, NY, USA');
  const [customPreference, setCustomPreference] = useState('');
  
  useEffect(() => {
     if (spaceConfigurations[activeSpaceType].subSpaces.length > 0) {
        setSelectedSubSpaces([spaceConfigurations[activeSpaceType].subSpaces[0]]);
     } else {
        setSelectedSubSpaces([]);
     }
  }, [activeSpaceType]);
  
  useEffect(() => {
    switch (bhk) {
        case 1: setNumBathrooms(1); setNumBalconies(1); break;
        case 2: setNumBathrooms(2); setNumBalconies(1); break;
        case 3: setNumBathrooms(3); setNumBalconies(2); break;
        case 4: setNumBathrooms(4); setNumBalconies(2); break;
        case 5: setNumBathrooms(5); setNumBalconies(3); break;
        default: break;
    }
  }, [bhk]);

  const handleSubSpaceChange = (subSpace: string) => {
    setSelectedSubSpaces(prev => 
      prev.includes(subSpace) ? prev.filter(s => s !== subSpace) : [...prev, subSpace]
    );
  }

  const toggleSelection = (item: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
      setter(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (selectedSubSpaces.length === 0) { alert("Please select at least one sub-space."); return; }
    if (!length || !width || !height) { alert("Please fill in all dimension fields."); return; }

    const styleText = selectedStyle ? `Architectural Style: ${selectedStyle}.\n` : '';
    const materialsText = selectedMaterials.length > 0 ? `Key Materials: ${selectedMaterials.join(', ')}.\n` : '';
    const featuresText = selectedFeatures.length > 0 ? `Key Features: ${selectedFeatures.join(', ')}.\n` : '';
    
    const generatedText = `${styleText}${materialsText}${featuresText}`;
    const finalCustomPreference = generatedText ? `${generatedText}\n${customPreference}` : customPreference;

    const brief: ProjectBrief = {
      projectName,
      dimensions: { length: Number(length), width: Number(width), height: Number(height), unit: unit },
      spaceType: activeSpaceType,
      subSpaces: selectedSubSpaces,
      customPreference: finalCustomPreference,
      structuralConstraints,
      location,
      flatConfiguration: activeSpaceType === 'Residential' && selectedSubSpaces.includes('Flat') ? { bhk, numBathrooms: Number(numBathrooms), numBalconies: Number(numBalconies) } : undefined,
    };
    onSubmit(brief);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">Architecture Studio</h1>
            <p className="mt-4 text-lg text-gray-400">Craft a detailed brief and our AI agent team will generate a complete architectural proposal.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-brand-surface rounded-xl border border-brand-border shadow-2xl shadow-black/20">
            <AccordionSection title="Project Details" icon={DocumentTextIcon} isOpen={openSection === 'details'} onToggle={() => setOpenSection(openSection === 'details' ? '' : 'details')}>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="projectName" className="block text-sm font-medium text-gray-400 mb-2">Project Name</label>
                        <input type="text" id="projectName" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="w-full bg-brand-dark border border-brand-border rounded-md shadow-sm py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-amber-500 transition" required />
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-400 mb-2">Project Location <span className='text-gray-500'>(for compliance)</span></label>
                        <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-brand-dark border border-brand-border rounded-md shadow-sm py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-amber-500 transition" placeholder="e.g., Austin, TX, USA" required />
                    </div>
                </div>
            </AccordionSection>
        
            <AccordionSection title="Space Definition" icon={HomeIcon} isOpen={openSection === 'space'} onToggle={() => setOpenSection(openSection === 'space' ? '' : 'space')}>
                <div className="grid grid-cols-2 gap-4">
                    {(Object.keys(spaceConfigurations) as SpaceType[]).map((type) => {
                        const Icon = spaceConfigurations[type].icon;
                        return <button key={type} type="button" onClick={() => setActiveSpaceType(type)} className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${activeSpaceType === type ? 'bg-brand-amber-900/40 border-brand-amber-500 shadow-lg' : 'bg-brand-dark border-brand-border hover:border-brand-amber-600'}`}>
                            <Icon className={`h-8 w-8 mb-2 transition-colors ${activeSpaceType === type ? 'text-brand-amber-500' : 'text-gray-400'}`} />
                            <span className={`font-semibold text-center transition-colors ${activeSpaceType === type ? 'text-brand-amber-400' : 'text-gray-300'}`}>{type}</span>
                        </button>
                    })}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Sub-spaces to include:</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {spaceConfigurations[activeSpaceType].subSpaces.map(subSpace => (
                            <label key={subSpace} className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${selectedSubSpaces.includes(subSpace) ? 'bg-brand-amber-800/60' : 'bg-brand-dark hover:bg-white/5'}`}>
                                <input type="checkbox" checked={selectedSubSpaces.includes(subSpace)} onChange={() => handleSubSpaceChange(subSpace)} className="h-4 w-4 rounded bg-brand-surface border-brand-border text-brand-amber-600 focus:ring-brand-amber-500" />
                                <span className="ml-3 text-gray-300">{subSpace}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {activeSpaceType === 'Residential' && selectedSubSpaces.includes('Flat') && (
                    <div className="mt-4 p-4 bg-brand-dark/50 rounded-lg border border-brand-border/60 animate-fadeIn">
                        <h4 className="font-semibold text-gray-300 mb-3">Flat Configuration</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">BHK (Bedrooms, Hall, Kitchen)</label>
                                <div className="flex gap-1 bg-brand-dark p-1 rounded-md">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <button type="button" key={n} onClick={() => setBhk(n)} className={`flex-1 text-center font-semibold p-2 rounded-md transition-colors text-sm ${bhk === n ? 'bg-brand-amber-600 text-white shadow' : 'text-gray-300 hover:bg-white/5'}`}>
                                    {n}
                                    </button>
                                ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="numBathrooms" className="block text-sm font-medium text-gray-400 mb-1">Bathrooms</label>
                                    <input type="number" id="numBathrooms" value={numBathrooms} onChange={e => setNumBathrooms(e.target.value)} min="1" className="w-full bg-brand-dark border border-brand-border rounded-md py-2 px-3 text-gray-200" required />
                                </div>
                                <div>
                                    <label htmlFor="numBalconies" className="block text-sm font-medium text-gray-400 mb-1">Balconies</label>
                                    <input type="number" id="numBalconies" value={numBalconies} onChange={e => setNumBalconies(e.target.value)} min="0" className="w-full bg-brand-dark border border-brand-border rounded-md py-2 px-3 text-gray-200" required />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </AccordionSection>

            <AccordionSection title="Style & Elements" icon={PaletteIcon} isOpen={openSection === 'style'} onToggle={() => setOpenSection(openSection === 'style' ? '' : 'style')}>
                <div>
                    <label htmlFor="archStyle" className="block text-sm font-medium text-gray-400 mb-2">Architectural Style</label>
                    <select id="archStyle" value={selectedStyle} onChange={e => setSelectedStyle(e.target.value)} className="w-full bg-brand-dark border border-brand-border rounded-md shadow-sm py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-amber-500 transition">
                        <option value="">Select a style...</option>
                        {architecturalStyles.map(style => <option key={style.name} value={style.name}>{style.name}</option>)}
                    </select>
                    {selectedStyle && <p className="text-xs text-gray-500 mt-2">{architecturalStyles.find(s=>s.name === selectedStyle)?.description}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Key Materials</label>
                    <div className="flex flex-wrap gap-2">
                        {[...materialsLibrary.facade, ...materialsLibrary.interior].slice(0,12).map(material => (
                            <button type="button" key={material} onClick={() => toggleSelection(material, selectedMaterials, setSelectedMaterials)} className={`px-3 py-1.5 text-xs rounded-full transition-colors ${selectedMaterials.includes(material) ? 'bg-brand-amber-600 text-white font-semibold' : 'bg-brand-dark text-gray-300 hover:bg-white/10'}`}>
                                {material}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Key Features</label>
                    <div className="flex flex-wrap gap-2">
                        {designFeatures.map(feature => (
                            <button type="button" key={feature} onClick={() => toggleSelection(feature, selectedFeatures, setSelectedFeatures)} className={`px-3 py-1.5 text-xs rounded-full transition-colors ${selectedFeatures.includes(feature) ? 'bg-brand-amber-600 text-white font-semibold' : 'bg-brand-dark text-gray-300 hover:bg-white/10'}`}>
                                {feature}
                            </button>
                        ))}
                    </div>
                </div>
            </AccordionSection>

            <AccordionSection title="Dimensions" icon={CubeIcon} isOpen={openSection === 'dims'} onToggle={() => setOpenSection(openSection === 'dims' ? '' : 'dims')}>
                <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-3 grid grid-cols-3 gap-3">
                        <div><label htmlFor="length" className="block text-sm text-gray-400 mb-1">Length</label><input type="number" id="length" value={length} onChange={e => setLength(e.target.value)} className="w-full bg-brand-dark border border-brand-border rounded-md py-2 px-3 text-gray-200" required /></div>
                        <div><label htmlFor="width" className="block text-sm text-gray-400 mb-1">Width</label><input type="number" id="width" value={width} onChange={e => setWidth(e.target.value)} className="w-full bg-brand-dark border border-brand-border rounded-md py-2 px-3 text-gray-200" required /></div>
                        <div><label htmlFor="height" className="block text-sm text-gray-400 mb-1">Height</label><input type="number" id="height" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-brand-dark border border-brand-border rounded-md py-2 px-3 text-gray-200" required /></div>
                    </div>
                    <div><label htmlFor="unit" className="block text-sm text-gray-400 mb-1">Unit</label><select id="unit" value={unit} onChange={e => setUnit(e.target.value as DimensionUnit)} className="w-full bg-brand-dark border border-brand-border rounded-md py-2 px-3 text-gray-200"><option value={DimensionUnit.FEET}>ft</option><option value={DimensionUnit.METERS}>m</option></select></div>
                </div>
            </AccordionSection>

            <AccordionSection title="Requirements & Constraints" icon={AdjustmentsHorizontalIcon} isOpen={openSection === 'constraints'} onToggle={() => setOpenSection(openSection === 'constraints' ? '' : 'constraints')}>
                <div>
                    <label htmlFor="structural_constraints" className="block text-sm font-medium text-gray-400 mb-2">Existing Structural Constraints</label>
                    <textarea id="structural_constraints" rows={2} value={structuralConstraints} onChange={(e) => setStructuralConstraints(e.target.value)} className="w-full bg-brand-dark border border-brand-border rounded-md shadow-sm py-2 px-3 text-gray-200" placeholder="e.g., Load-bearing column at corner."></textarea>
                </div>
                <div>
                    <label htmlFor="custom_preference" className="block text-sm font-medium text-gray-400 mb-2">Custom Requirements <span className="text-gray-500">(add your text below)</span></label>
                    <textarea id="custom_preference" rows={4} value={customPreference} onChange={(e) => setCustomPreference(e.target.value)} className="w-full bg-brand-dark border border-brand-border rounded-md shadow-sm py-2 px-3 text-gray-200" placeholder="e.g., I need a G+2 building with a modern facade and a home theater."></textarea>
                </div>
            </AccordionSection>

            <div className="p-5 mt-2">
                <button type="submit" disabled={isLoading} className="w-full inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-lg shadow-lg text-brand-dark bg-gradient-to-r from-brand-amber-400 to-brand-amber-500 hover:from-brand-amber-500 hover:to-brand-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-brand-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105" aria-live="polite">
                {isLoading ? 'Architecting...' : 'Assemble the Team'}
                <SparklesIcon className={`ml-3 h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
                </button>
            </div>
        </form>
    </div>
  );
};
