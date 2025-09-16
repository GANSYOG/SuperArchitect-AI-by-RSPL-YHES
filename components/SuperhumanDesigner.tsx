import React, { useState } from 'react';
import { generateSuperhumanDesigns } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { downloadUrl } from '../utils/exportUtils';

type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

const aspectRatios: AspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4"];

export const SuperhumanDesigner: React.FC = () => {
    const [prompt, setPrompt] = useState('Photorealistic interior shot of a luxurious living room in a modern Japanese penthouse, with a sunken sofa, large windows overlooking a rainy Tokyo skyline at night, minimalist decor, and warm ambient lighting.');
    const [numberOfImages, setNumberOfImages] = useState(2);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);

        try {
            const images = await generateSuperhumanDesigns(prompt, numberOfImages, aspectRatio);
            setGeneratedImages(images);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = (imageUrl: string, index: number) => {
        const fileName = `superhuman-design-${index + 1}.jpg`;
        downloadUrl(imageUrl, fileName);
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 animate-fadeIn">
            <header className="flex items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-100">Superhuman Designer Studio</h1>
                    <p className="text-gray-400 mt-1">A singular, powerful AI agent for high-fidelity visual concept generation.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 items-start">
                {/* Controls Panel */}
                <form onSubmit={handleGenerate} className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-6 sticky top-28">
                    <div>
                        <label htmlFor="design-prompt" className="block text-lg font-bold text-amber-400 mb-2">Design Prompt</label>
                        <textarea
                            id="design-prompt"
                            rows={8}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                            placeholder="e.g., A cinematic, photorealistic render of a cyberpunk city street at night..."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="num-images" className="block text-sm font-medium text-gray-400 mb-1">Images</label>
                            <input
                                type="number"
                                id="num-images"
                                value={numberOfImages}
                                onChange={e => setNumberOfImages(Math.max(1, Math.min(4, parseInt(e.target.value) || 1)))}
                                min="1" max="4"
                                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-gray-200"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-400 mb-1">Aspect Ratio</label>
                            <select
                                id="aspect-ratio"
                                value={aspectRatio}
                                onChange={e => setAspectRatio(e.target.value as AspectRatio)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-gray-200"
                            >
                                {aspectRatios.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <button type="submit" disabled={isLoading} className="w-full inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-md shadow-lg text-gray-900 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                            {isLoading ? 'Generating...' : 'Generate'}<SparklesIcon className={`ml-3 h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </form>

                {/* Results Panel */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 min-h-[600px] flex flex-col">
                    {isLoading && (
                        <div className="flex-grow flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 border-4 border-t-transparent border-amber-500 rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-400">The Superhuman Designer is concentrating...</p>
                        </div>
                    )}

                    {error && !isLoading && (
                        <div className="flex-grow flex flex-col items-center justify-center text-center">
                            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm flex items-center gap-3">
                                <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        </div>
                    )}
                    
                    {!isLoading && !error && generatedImages.length === 0 && (
                         <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-600">
                            <PhotoIcon className="w-20 h-20 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-400">Your generated designs will appear here.</h3>
                            <p className="text-sm">Use the panel on the left to craft a prompt and generate images.</p>
                        </div>
                    )}

                    {!isLoading && generatedImages.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {generatedImages.map((imgSrc, index) => (
                                <div key={index} className="relative group aspect-video bg-gray-800 rounded-md overflow-hidden animate-fadeIn">
                                    <img src={imgSrc} alt={`Generated Design ${index + 1}`} className="w-full h-full object-contain" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button 
                                            onClick={() => handleDownload(imgSrc, index)}
                                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full bg-white/90 text-gray-900 backdrop-blur-sm hover:bg-white"
                                        >
                                            <DownloadIcon className="w-4 h-4" />
                                            Download
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};