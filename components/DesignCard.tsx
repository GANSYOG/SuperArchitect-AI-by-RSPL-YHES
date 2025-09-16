

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
  const mainImage = dayView?.url || design.exteriorImageUrls[0]?.url || "https://placehold.co/1280x720/111827/f59e0b/png?text=Image+Loading...";

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-amber-900/30 border border-gray-800 hover:border-amber-800/50 flex flex-col transition-all duration-300 group">
      {/* Media view */}
      <div className="relative aspect-video bg-gray-800">
        {!imageLoaded && <div className="absolute inset-0 flex items-center justify-center" aria-label="Loading image"><div className="w-8 h-8 border-4 border-t-transparent border-amber-500 rounded-full animate-spin"></div></div>}
        <img
            src={mainImage}
            alt={design.title}
            className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
        />
        {design.architecturalStyle && (
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg">
                {design.architecturalStyle}
            </div>
        )}
         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              onClick={onSelect}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-white/90 text-gray-900 font-bold backdrop-blur-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-white"
              aria-label={`View details for ${design.title}`}
            >
                <ArrowsExpandIcon className="w-5 h-5"/>
                View Details
            </button>
        </div>
      </div>


      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-100 mb-1 truncate" title={design.title}>
          {design.title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
          {design.description}
        </p>

        {design.materials?.length > 0 && (
            <div className="mt-auto pt-4 border-t border-gray-800">
                <h4 className="font-semibold text-gray-500 mb-2 text-xs uppercase tracking-wider">Key Materials</h4>
                <div className="flex flex-wrap gap-2">
                {design.materials.slice(0, 3).map((material, i) => (
                    <span key={i} className="px-2.5 py-1 text-xs bg-gray-800 text-gray-300 rounded-full">{material}</span>
                ))}
                {design.materials.length > 3 && <span className="px-2.5 py-1 text-xs bg-gray-800 text-gray-300 rounded-full">+{design.materials.length - 3}</span>}
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