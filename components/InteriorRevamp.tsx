import React, { useState, useRef, useEffect } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { revampInteriorImage, generateFurnitureImage } from '../services/geminiService';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { ShoppingListItem, PlacedItem } from '../types';
import { CubeTransparentIcon } from './icons/CubeTransparentIcon';

type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
const REVAMP_SESSION_KEY = 'superarchitect-revamp-session';

const getClosestAspectRatio = (width: number, height: number): AspectRatio => {
    const ratio = width / height;
    const supportedRatios: { [key in AspectRatio]: number } = { "16:9": 16 / 9, "4:3": 4 / 3, "1:1": 1, "3:4": 3 / 4, "9:16": 9 / 16 };
    let closest: AspectRatio = "1:1";
    let minDifference = Infinity;
    for (const key in supportedRatios) {
        const r = supportedRatios[key as AspectRatio];
        const difference = Math.abs(ratio - r);
        if (difference < minDifference) {
            minDifference = difference;
            closest = key as AspectRatio;
        }
    }
    return closest;
};

const ImageComparator: React.FC<{original: string; revamped: string}> = ({ original, revamped }) => {
    const [sliderPos, setSliderPos] = useState(50);
  
    return (
        <div className="comparison-slider w-full h-full">
            <img src={original} alt="Original" />
            <img src={revamped} alt="Revamped" className="revamped-image" style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }} />
            <input 
                type="range" 
                min="0" 
                max="100" 
                value={sliderPos} 
                onChange={(e) => setSliderPos(parseFloat(e.target.value))}
                aria-label="Image comparison slider"
            />
            <div className="slider-handle" style={{ left: `${sliderPos}%` }}></div>
        </div>
    );
};

export const InteriorRevamp: React.FC = () => {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
    const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
    const [stylePrompt, setStylePrompt] = useState('A cozy, minimalist living room with Scandinavian influences, featuring light oak wood, plush white textiles, and abundant natural light.');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [saveMessage, setSaveMessage] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    const [activeInteraction, setActiveInteraction] = useState<{
        id: string;
        type: 'drag' | 'resize' | 'rotate';
        startX: number;
        startY: number;
        startW?: number;
        startH?: number;
        startRot?: number;
    } | null>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result as string);
                setGeneratedImage(null);
                setShoppingList([]);
                setPlacedItems([]);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!uploadedImage) { setError("Please upload an image first."); return; }
        if (!stylePrompt.trim()) { setError("Please provide a style description."); return; }

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        setShoppingList([]);
        setPlacedItems([]);

        try {
            const img = new Image();
            img.src = uploadedImage;
            img.onload = async () => {
                try {
                    const aspectRatio = getClosestAspectRatio(img.width, img.height);
                    const { revampedImageUrl, shoppingList: newShoppingList } = await revampInteriorImage(uploadedImage, stylePrompt, aspectRatio);
                    setGeneratedImage(revampedImageUrl);
                    setShoppingList(newShoppingList);
                } catch (err) {
                     setError(err instanceof Error ? err.message : 'An unknown error occurred during generation.');
                } finally {
                     setIsLoading(false);
                }
            };
            img.onerror = () => { throw new Error("Could not load image to determine its dimensions."); }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while processing the image.');
            setIsLoading(false);
        }
    };
    
    const handleSaveSession = () => {
        try {
            const sessionData = { uploadedImage, generatedImage, shoppingList, placedItems, stylePrompt };
            localStorage.setItem(REVAMP_SESSION_KEY, JSON.stringify(sessionData));
            setSaveMessage('Session saved successfully!');
            setTimeout(() => setSaveMessage(''), 2000);
        } catch (e) {
            setError('Failed to save session. Local storage might be full.');
        }
    };
    
    const handleLoadSession = () => {
        try {
            const savedData = localStorage.getItem(REVAMP_SESSION_KEY);
            if(savedData) {
                const sessionData = JSON.parse(savedData);
                setUploadedImage(sessionData.uploadedImage || null);
                setGeneratedImage(sessionData.generatedImage || null);
                setShoppingList(sessionData.shoppingList || []);
                setPlacedItems(sessionData.placedItems || []);
                setStylePrompt(sessionData.stylePrompt || '');
                setError(null);
            } else {
                 setError('No saved session found.');
            }
        } catch (e) {
            setError('Failed to load session. The saved data might be corrupted.');
        }
    };

    const handleTryOn = async (itemIndex: number) => {
        const item = filteredShoppingList[itemIndex];
        if (!item || item.isGenerating) return;

        // Update the main shopping list, not the filtered one
        setShoppingList(prev => prev.map(li => li.itemName === item.itemName ? { ...li, isGenerating: true } : li));

        try {
            const imageUrl = await generateFurnitureImage(item.imageGenPrompt);
            const newItem: PlacedItem = {
                id: `${item.itemName.replace(/\s/g, '')}-${Date.now()}`,
                shoppingItem: { ...item, imageUrl },
                x: 50, y: 50, width: 150, height: 150, rotation: 0,
            };
            setPlacedItems(prev => [...prev, newItem]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate item.");
        } finally {
            setShoppingList(prev => prev.map(li => li.itemName === item.itemName ? { ...li, isGenerating: false } : li));
        }
    };

    const onMouseDown = (e: React.MouseEvent, id: string, type: 'drag' | 'resize' | 'rotate') => {
        e.preventDefault();
        e.stopPropagation();
        const item = placedItems.find(p => p.id === id);
        if (!item) return;

        setActiveInteraction({
            id, type, startX: e.clientX, startY: e.clientY,
            startW: item.width, startH: item.height, startRot: item.rotation
        });
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!activeInteraction || !canvasRef.current) return;
        const { id, type, startX, startY, startW, startH, startRot } = activeInteraction;
        const canvasRect = canvasRef.current.getBoundingClientRect();
        
        setPlacedItems(prev => prev.map(item => {
            if (item.id === id) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                switch(type) {
                    case 'drag':
                        const newX = ((item.x * canvasRect.width / 100) + dx) / canvasRect.width * 100;
                        const newY = ((item.y * canvasRect.height / 100) + dy) / canvasRect.height * 100;
                        return { ...item, x: newX, y: newY };
                    case 'resize':
                        const newWidth = Math.max(30, startW! + dx);
                        const aspectRatio = startW! / startH!;
                        return { ...item, width: newWidth, height: newWidth / aspectRatio };
                    case 'rotate':
                        const centerX = (item.x * canvasRect.width / 100);
                        const centerY = (item.y * canvasRect.height / 100);
                        const startAngle = Math.atan2(startY - centerY, startX - centerX) * (180 / Math.PI);
                        const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
                        return { ...item, rotation: startRot! + (currentAngle - startAngle) };
                }
            }
            return item;
        }));
    };
    
    useEffect(() => {
        const handleMouseUp = () => setActiveInteraction(null);
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, []);

    const filteredShoppingList = shoppingList.filter(item => 
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 animate-fadeIn" onMouseMove={onMouseMove}>
            <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-100">Interior Revamp Studio</h1>
                        <p className="text-gray-400 mt-1">Reimagine your space and virtually try-on new furniture.</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <button onClick={handleSaveSession} className="px-3 py-1.5 text-xs font-semibold rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors">Save Session</button>
                    <button onClick={handleLoadSession} className="px-3 py-1.5 text-xs font-semibold rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors">Load Session</button>
                    {saveMessage && <span className="text-green-400 text-xs animate-fadeIn">{saveMessage}</span>}
                </div>
            </header>
            
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-8">
                {/* Left Panel: Controls & Shopping List */}
                <div className="space-y-6">
                    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-amber-400 mb-2">1. Upload Your Space</h2>
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden"/>
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed border-gray-700 hover:border-amber-500 hover:bg-gray-800/50 transition-colors text-gray-400 hover:text-amber-400">
                                <PhotoIcon className="w-8 h-8" /><span className="font-semibold text-sm">{uploadedImage ? "Change Image" : "Upload an Image"}</span>
                            </button>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-amber-400 mb-2">2. Describe Your Vision</h2>
                            <textarea rows={5} value={stylePrompt} onChange={(e) => setStylePrompt(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition" placeholder="e.g., A brutalist style..."/>
                        </div>
                        <div>
                            <button onClick={handleGenerate} disabled={isLoading || !uploadedImage} className="w-full inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-bold rounded-md shadow-lg text-gray-900 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                                {isLoading ? 'Revamping...' : 'Revamp Interior'}<SparklesIcon className={`ml-3 h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                    {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm flex items-center gap-3"><ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" /><p>{error}</p></div>}
                    {shoppingList.length > 0 && (
                        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 animate-fadeIn">
                             <h2 className="text-xl font-bold text-amber-400 mb-4">3. Shopping & Virtual Try-On</h2>
                             <div className="mb-4">
                                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search shopping list..." className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-sm text-gray-200 focus:ring-amber-500 focus:border-amber-500" />
                             </div>
                             <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {filteredShoppingList.map((item, index) => (
                                    <div key={index} className="bg-gray-800/60 p-3 rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-gray-200">{item.itemName}</h4>
                                                <p className="text-xs text-gray-400">{item.description}</p>
                                                <p className="text-sm font-semibold text-amber-400 mt-1">{item.estimatedPrice}</p>
                                            </div>
                                            <button onClick={() => handleTryOn(index)} disabled={item.isGenerating} className="flex-shrink-0 flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold rounded-md bg-gray-700 text-gray-200 hover:bg-amber-600 hover:text-white transition-colors disabled:opacity-50">
                                                {item.isGenerating ? <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin"></div> : <CubeTransparentIcon className="w-4 h-4" />} Try-On
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {filteredShoppingList.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No items match your search.</p>}
                             </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: Results */}
                <div className="grid grid-cols-2 gap-4 bg-gray-900/50 border border-gray-800 rounded-lg p-4 min-h-[500px]">
                    <div className="flex flex-col items-center justify-center">
                        <h3 className="font-semibold text-gray-400 mb-2">Original & Try-On Canvas</h3>
                        <div ref={canvasRef} className="w-full aspect-square bg-gray-800/50 rounded-md flex items-center justify-center relative overflow-hidden">
                           {uploadedImage ? <img src={uploadedImage} alt="Original" className="w-full h-full object-contain" /> : <PhotoIcon className="w-12 h-12 text-gray-700"/> }
                           {placedItems.map(item => (
                               <div key={item.id} className={`absolute group cursor-move ${activeInteraction?.id === item.id ? 'z-20' : 'z-10'}`} style={{ left: `${item.x}%`, top: `${item.y}%`, transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`, width: item.width, height: item.height }} onMouseDown={(e) => onMouseDown(e, item.id, 'drag')}>
                                   {item.shoppingItem.imageUrl && <img src={item.shoppingItem.imageUrl} alt={item.shoppingItem.itemName} className="w-full h-full object-contain pointer-events-none" />}
                                   <div className={`absolute -inset-1 border-2 border-dashed border-amber-500 rounded-md opacity-0 group-hover:opacity-100 ${activeInteraction?.id === item.id ? '!opacity-100' : ''}`}></div>
                                   <div onMouseDown={(e) => onMouseDown(e, item.id, 'resize')} className="absolute -bottom-2 -right-2 w-4 h-4 bg-amber-500 rounded-full cursor-nwse-resize opacity-0 group-hover:opacity-100"></div>
                                   <div onMouseDown={(e) => onMouseDown(e, item.id, 'rotate')} className="absolute -top-2 -right-2 w-4 h-4 bg-amber-500 rounded-full cursor-alias opacity-0 group-hover:opacity-100"></div>
                               </div>
                           ))}
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <h3 className="font-semibold text-gray-400 mb-2">Before & After</h3>
                        <div className="w-full aspect-square bg-gray-800/50 rounded-md flex items-center justify-center relative">
                           {isLoading && <div className="w-10 h-10 border-4 border-t-transparent border-amber-500 rounded-full animate-spin"></div>}
                           {generatedImage && uploadedImage && <ImageComparator original={uploadedImage} revamped={generatedImage} />}
                           {!isLoading && !generatedImage && <SparklesIcon className="w-12 h-12 text-gray-700"/> }
                           {!isLoading && uploadedImage && !generatedImage && <div className="absolute inset-0 flex items-center justify-center text-center text-gray-500 p-4">Your revamped image will appear here.</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};