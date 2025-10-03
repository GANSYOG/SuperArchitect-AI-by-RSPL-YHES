import React, { useState } from 'react';
import type { Design } from '../types';
import { ArrowsExpandIcon } from './icons/ArrowsExpandIcon';

interface DesignCardProps {
  design: Design;
  onSelect: () => void;
}

export const DesignCard: React.FC<DesignCardProps> = ({ design, onSelect }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const dayView = design.exteriorImageUrls.find(img => img.view.toLowerCase() === 'day');
  const mainImage = dayView?.url || design.exteriorImageUrls[0]?.url || "https://placehold.co/1280x720/1F2937/F59E0B/png?text=Image+Loading...";

  return (
    <div className="bg-brand-surface rounded-xl overflow-hidden shadow-lg hover:shadow-brand-amber-900/40 border border-brand-border hover:border-brand-amber-700/50 flex flex-col transition-all duration-300 group hover:-translate-y-1">
      <div className="relative aspect-video bg-brand-dark">
        {!imageLoaded && <div className="absolute inset-0 flex items-center justify-center" aria-label="Loading image"><div className="w-8 h-8 border-4 border-t-transparent border-brand-amber-500 rounded-full animate-spin"></div></div>}
        <img
            src={mainImage}
            alt={design.title}
            className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

        {design.architecturalStyle && (
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-brand-amber-300 text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg">
                {design.architecturalStyle}
            </div>
        )}
        <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-lg font-bold text-white mb-1 truncate" title={design.title}>
                {design.title}
            </h3>
        </div>
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              onClick={onSelect}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/90 text-gray-900 font-bold backdrop-blur-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-white transition-transform transform group-hover:scale-100 scale-95"
              aria-label={`View details for ${design.title}`}
            >
                <ArrowsExpandIcon className="w-5 h-5"/>
                View Details
            </button>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
          {design.description}
        </p>

        {design.materials?.length > 0 && (
            <div className="mt-auto pt-4 border-t border-brand-border">
                <h4 className="font-semibold text-gray-500 mb-2 text-xs uppercase tracking-wider">Key Materials</h4>
                <div className="flex flex-wrap gap-2">
                {design.materials.slice(0, 3).map((material, i) => (
                    <span key={i} className="px-2.5 py-1 text-xs bg-brand-dark text-gray-300 rounded-full">{material}</span>
                ))}
                {design.materials.length > 3 && <span className="px-2.5 py-1 text-xs bg-brand-dark text-gray-300 rounded-full">+{design.materials.length - 3}</span>}
                </div>
            </div>
        )}
      </div>
       <style>{`
        .line-clamp-2 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
        }
      `}</style>
    </div>
  );
};
