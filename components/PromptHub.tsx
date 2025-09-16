import React, { useState } from 'react';
import { DocumentDuplicateIcon } from './icons/DocumentDuplicateIcon';


const promptTemplates = [
    {
        title: 'Ambitious Residential: "The Peregrine\'s Nest"',
        location: "Big Sur, California, USA",
        details: `
**Custom Requirements:**
I envision a G+1 residence built in an organic modernist style, deeply integrated with the dramatic coastal landscape. The design should feel like it's grown from the cliffside itself, reminiscent of John Lautner's work or a modern interpretation of Fallingwater. The primary goal is to maximize the panoramic ocean views while maintaining a sense of sanctuary and privacy.

Key materials should be locally-sourced redwood, dark grey slate tile, exposed board-formed concrete, and vast panels of structural glass. The color palette should be earthy and natural, complementing the surrounding environment.

Core features must include:
1. A cantilevered infinity pool on the main level that appears to merge with the Pacific Ocean horizon.
2. A central, open-air courtyard with a preserved, mature redwood tree at its heart.
3. A "sky-bridge" library with glass floors connecting the master suite to the main living area.
4. The main living area should be a double-height space with a floor-to-ceiling glass wall that fully retracts, opening the space completely to the exterior terrace.
5. A green roof planted with native coastal grasses to help the structure blend into the landscape from above.

**Structural Constraints:**
The site has a significant downward slope towards the ocean. A portion of the foundation must be cantilevered over the cliff edge. Must adhere to California seismic building codes and coastal regulations for view preservation.
`
    },
    {
        title: 'High-Tech Corporate HQ: "The Synapse"',
        location: 'Seoul, South Korea',
        details: `
**Custom Requirements:**
Design a flagship G+10 headquarters for a leading AI robotics firm. The aesthetic should be 'Bionic-Tech' - blending sleek, futuristic forms with bio-mimicry and visible structural elements that resemble a neural network. It needs to be a showpiece of innovation.

The ground floor should be a public-facing gallery and cafe. Floors 1-5 are open-plan collaborative workspaces with modular furniture systems and abundant natural light. Floors 6-8 are secure R&D labs with specialized ventilation. Floor 9 is the executive suite, and Floor 10 is a rooftop 'recharge garden' with smart-glass canopies and embedded solar technology.

Key materials: White nano-concrete panels, anodized aluminum mesh, electrochromic glass, and polished steel accents. The interior should feature living green walls and data visualizations projected onto surfaces.

**Structural Constraints:**
The building is on a tight urban plot, requiring a small footprint with vertical expansion. Incorporate a double-helix external staircase as a major visual feature. Must meet LEED Platinum certification standards, with a focus on energy efficiency and rainwater harvesting.
`
    },
     {
        title: 'Luxury 3BHK Apartment Interior: "The Sky Garden"',
        location: 'Mumbai, India',
        details: `
**Custom Requirements:**
I need a full interior design for a 3BHK apartment. The configuration is strict: 3 bedrooms, 3 bathrooms, and 2 balconies. The style should be contemporary luxury with an emphasis on comfort and natural light.

The living room should be spacious with a large L-shaped sofa and a media wall. It must open onto the main balcony, which should be designed as a 'sky garden' with vertical planters and comfortable seating.

The master bedroom needs a walk-in closet and an en-suite bathroom. The other two bedrooms are for kids/guests. One should have an attached bathroom.

The kitchen should be a modern, modular design with an island and premium appliances. A small utility area is attached. The overall color palette should be neutral tones (beige, grey, white) with accents of gold and deep blue. Use materials like Italian marble, wood veneers, and brass fittings.

**Structural Constraints:**
The apartment is on the 25th floor of a high-rise. All designs must be for interiors only. The total area is approximately 1500 sq ft.
`
    },
    {
        title: 'Community Public Library: "The Redwood Scriptorium"',
        location: 'Portland, Oregon, USA',
        details: `
**Custom Requirements:**
Create a modern, two-story public library that feels like a warm, inviting sanctuary for reading and community gathering. The architectural style should be Pacific Northwest Modern, with a strong emphasis on sustainable and natural materials.

The core concept is a large, central atrium with a "tree of knowledge" sculptural staircase winding up to the second floor. The ground floor will house the children's section, community meeting rooms, and a cafe. The second floor will be a quiet-focused adult reading area and study zones with views into the surrounding park.

Key materials: Glulam timber beams, Douglas Fir cladding, large glass curtain walls to connect with nature, and locally sourced stone for the foundation. Use a warm, natural color palette. The entire structure should be carbon-neutral.

**Structural Constraints:**
The building is situated in a public park, so the design must minimize its environmental impact and preserve existing mature trees. The roof design should support a large array of solar panels and a rainwater collection system for irrigating the park.
`
    },
    {
        title: 'Sustainable Desert Home: "The Sunstone House"',
        location: 'Scottsdale, Arizona, USA',
        details: `
**Custom Requirements:**
Design a single-story, net-zero energy home in a Desert Modernism style. The design must prioritize sustainability and passive cooling strategies.

Key Materials: Rammed earth walls for thermal mass, Corten steel accents for a weathered look, polished concrete floors, and large overhangs made from reclaimed wood to create deep shade.

Core Features:
1.  A central breezeway that bisects the home, channeling prevailing winds for natural ventilation.
2.  A large, covered outdoor living area with a fireplace and plunge pool.
3.  A "solar canopy" over the carport that houses a comprehensive photovoltaic array, designed to generate 110% of the home's energy needs.
4.  Clerestory windows to provide indirect natural light while minimizing solar heat gain.
5.  An advanced rainwater harvesting and greywater recycling system to irrigate a landscape of native, drought-tolerant plants (xeriscaping).

**Structural Constraints:**
The property has strict building height limits to preserve views of the nearby mountains. The design must integrate seamlessly with the flat, arid landscape.
`
    },
    {
        title: 'Boutique Hotel Renovation: "The Artisan\'s Respite"',
        location: 'Kyoto, Japan',
        details: `
**Custom Requirements:**
Renovate a traditional two-story 'machiya' (wooden townhouse) into a 5-suite luxury boutique hotel. The style must be 'Japandi'—a fusion of Japanese minimalism and Scandinavian warmth.

The design must preserve key historical elements like the original wooden beams ('hari') and the small central courtyard ('tsuboniwa'). The ground floor should contain two suites, a small reception area, and a tea lounge overlooking the courtyard. The second floor will have three larger suites, each with a private hinoki wood soaking tub.

Key Materials: Light oak flooring, tatami mat accents, washi paper screens, black slate in the bathrooms, and warm, textured textiles. The color palette should be muted and serene.

**Structural Constraints:**
The original wooden structure must be reinforced to meet modern seismic standards without compromising the historic aesthetic. All modifications must respect local heritage building regulations. Modern plumbing and HVAC must be cleverly concealed.
`
    },
    {
        title: 'Tech Co-working Space: "The Catalyst Hub"',
        location: 'Berlin, Germany',
        details: `
**Custom Requirements:**
Convert a 2000 sq. meter former warehouse into a vibrant, tech-focused co-working space. The style should be Industrial with high-tech integrations.

The space needs to be zoned for different work modes:
1.  An open-plan 'hot desk' area with large communal tables.
2.  A dedicated 'quiet zone' with sound-proofed work pods.
3.  Multiple conference rooms equipped with augmented reality displays.
4.  A central social hub with a cafe, tiered seating for presentations, and recreational facilities (e.g., table tennis).
5.  A 'maker space' with 3D printers and electronics workbenches.

Key Features: Retain the exposed brick walls and steel roof trusses. Integrate a network of programmable LED light strips that can change the ambiance. Use polished concrete floors. Furniture should be modular and easily reconfigurable.

**Structural Constraints:**
The original warehouse has large, unsupported spans. Any new internal structures must be lightweight. The electrical and data infrastructure needs a major overhaul to support hundreds of users and high-power equipment.
`
    },
    {
        title: 'Modern Mediterranean Villa: "Villa Cybele"',
        location: 'Santorini, Greece',
        details: `
**Custom Requirements:**
Design a modern luxury villa that embraces the classic Mediterranean Revival style. The property is built into a cliffside, offering dramatic sea views.

The design should feature clean lines, whitewashed stucco walls, and iconic blue-domed accents. The layout should be spread across multiple terraces cascading down the cliff.
Core Features:
1.  An infinity pool on the main terrace that appears to blend with the Aegean Sea.
2.  A shaded central courtyard with a plunge pool and an ancient olive tree.
3.  Interiors should be minimalist, with built-in furniture made from smooth, white plaster and natural wood.
4.  Arched doorways and windows framing the sea views.
5.  A rooftop terrace designed for sunset viewing with an outdoor bar.

**Structural Constraints:**
The entire structure must be engineered for a steep, rocky cliffside. The foundation requires deep anchoring into the rock. The design must withstand high winds and the corrosive sea air.
`
    }
];

const PromptCard: React.FC<{ template: typeof promptTemplates[0] }> = ({ template }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const textToCopy = `${template.details.trim()}`;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gray-800/50 border border-gray-700/80 rounded-lg p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-amber-400">{template.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{template.location}</p>
            <div className="prose prose-sm prose-invert max-w-none text-gray-300 whitespace-pre-wrap font-mono text-xs border-l-2 border-gray-700 pl-4 py-2 bg-gray-900/40 rounded-md">
                {template.details.trim()}
            </div>
             <button onClick={handleCopy} className="mt-4 flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-md bg-gray-700 text-gray-200 hover:bg-amber-600 hover:text-white transition-colors disabled:opacity-70 disabled:cursor-wait">
                <DocumentDuplicateIcon className="w-4 h-4" />
                {copied ? 'Copied to Clipboard!' : 'Copy Requirements Text'}
            </button>
            <p className="text-xs text-gray-500 mt-2">Tip: Paste this into the "Custom Requirements" field. You can also manually set the Project Name and Location from this template.</p>
        </div>
    );
}

export const PromptHub: React.FC = () => {
    return (
        <div className="w-full max-w-5xl mx-auto p-4 md:p-8 animate-fadeIn">
            <header className="flex items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-100">Inspiration Hub</h1>
                    <p className="text-gray-400 mt-1">Guidance on crafting the perfect brief for our AI team.</p>
                </div>
            </header>

            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-amber-400 mb-2">The Anatomy of a Perfect Brief</h2>
                <p className="text-gray-400">
                    A great brief is more than a list of rooms; it's a story. It provides our AI team not just with constraints, but with a vision, a feeling, and a purpose. The more detail and narrative you provide in the <strong className="text-amber-300">Custom Requirements</strong>, the more unique and tailored your designs will be. Think about the style, the key features, the materials, and the atmosphere you want to create. Use the templates below as inspiration.
                </p>
                <p className="text-gray-400 mt-2">
                    - <strong className="text-gray-300">Project Lead</strong>
                </p>
            </div>

            <div className="space-y-8">
                {promptTemplates.map(template => (
                    <PromptCard key={template.title} template={template} />
                ))}
            </div>
             <style>{`
                .animate-fadeIn { animation: fadeIn 0.5s ease-in-out; }
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .prose-invert {
                    --tw-prose-body: theme(colors.gray[300]);
                    --tw-prose-headings: theme(colors.gray[100]);
                    --tw-prose-lead: theme(colors.gray[400]);
                    --tw-prose-links: theme(colors.amber[400]);
                    --tw-prose-bold: theme(colors.white);
                    --tw-prose-counters: theme(colors.gray[400]);
                    --tw-prose-bullets: theme(colors.gray[600]);
                    --tw-prose-hr: theme(colors.gray[700]);
                    --tw-prose-quotes: theme(colors.gray[200]);
                    --tw-prose-quote-borders: theme(colors.gray[700]);
                    --tw-prose-captions: theme(colors.gray[400]);
                    --tw-prose-code: theme(colors.amber[300]);
                    --tw-prose-pre-code: theme(colors.gray[300]);
                    --tw-prose-pre-bg: theme(colors.gray[900]);
                    --tw-prose-th-borders: theme(colors.gray[600]);
                    --tw-prose-td-borders: theme(colors.gray[700]);
                }
            `}</style>
        </div>
    );
};