import { GoogleGenAI, Type, Chat, Modality } from "@google/genai";
import type { Design, ProjectBrief, FinishesSchedule, Dimensions, CostAnalysis, SustainabilityReport, BillOfQuantitiesItem, ShoppingListItem } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
let chat: Chat | null = null;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const SAAI_AGENTS = [
    { agent: "Project Lead", role: "Analyzes brief & coordinates team" },
    { agent: "Concept Architect", role: "Generates core design concepts" },
    { agent: "Visual Synthesis AI", role: "Generates all renders & plans" },
    { agent: "Materials Specialist", role: "Details finishes and materials" },
    { agent: "Cost Estimator AI", role: "Estimates project costs & BOQ" },
    { agent: "Eco-Analyst AI", role: "Analyzes sustainability factors" },
    { agent: "Compliance AI", role: "Performs regulatory checks" },
    { agent: "Data Integrator", role: "Assembles final project data" }
];

type StatusUpdater = (status: { agentName: string; status: 'working' | 'complete' | 'error'; message: string; }) => void;

export const generateAgentAvatar = async (prompt: string): Promise<string> => {
    const fullPrompt = `Minimalist vector art portrait of a futuristic AI agent. Subject: ${prompt}. Clean lines, simple shapes, on a dark background, single character focus.`;

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: { 
                numberOfImages: 1, 
                outputMimeType: 'image/jpeg', 
                aspectRatio: '1:1' 
            },
        });
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error(`Agent Avatar generation failed for prompt: "${prompt}"`, error);
        throw new Error("Failed to generate avatar. The visual synthesis module might be offline.");
    }
}


const processInParallel = async <T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    concurrencyLimit: number,
    updateProgress?: (completed: number, total: number) => void
): Promise<R[]> => {
    const results: R[] = [];
    const queue = [...items.entries()]; // [index, item]
    let completedCount = 0;

    const worker = async () => {
        while (queue.length > 0) {
            const [index, item] = queue.shift()!;
            try {
                const result = await processor(item);
                results[index] = result;
            } catch (error) {
                console.error(`Error processing item at index ${index}:`, error);
                // Allow graceful failure for single item
            } finally {
                completedCount++;
                if (updateProgress) {
                    updateProgress(completedCount, items.length);
                }
            }
        }
    };

    const workers = Array(concurrencyLimit).fill(null).map(worker);
    await Promise.all(workers);

    return results;
}


const generateAllVisuals = async (designs: Design[], updateStatus: StatusUpdater): Promise<Design[]> => {
    const allVisualPrompts: ({
        type: 'day' | 'night' | 'interior' | 'plan';
        prompt: string;
        level?: string; // For plan
        room?: string; // For interior
        designIndex: number;
        dimensions?: Dimensions;
    })[] = [];

    designs.forEach((design, designIndex) => {
        if (Array.isArray(design.internalImagePrompts)) {
            design.internalImagePrompts.forEach(p => {
                if(p.prompt) allVisualPrompts.push({ ...p, designIndex, dimensions: design.dimensions });
            });
        }
    });
    
    updateStatus({ agentName: 'Visual Synthesis AI', status: 'working', message: `Initiating high-speed synthesis for ${allVisualPrompts.length} assets...` });

    const generateImage = async (p: typeof allVisualPrompts[0]) => {
        const currentDesign = designs[p.designIndex];
        let fullPrompt: string;
        let config: any;
        let placeholderUrl: string;

        if (p.type === 'plan') {
             const cadStyles = [
                {
                    name: 'Minimalist Presentation Style',
                    description: `**Drafting Style:** Adopt a MINIMALIST PRESENTATION style. Use fine, consistent line weights. Clearly define spaces with minimal annotations. Include simple, abstract block-like furniture to suggest scale and function but avoid excessive detail. The focus is on a clean, elegant architectural layout and spatial flow. Use a subtle greyscale for wall fills. The final image should feel like a high-end architectural publication.`
                },
                {
                    name: 'Hyper-Detailed Technical Style',
                    description: `**Drafting Style:** Adopt a HYPER-DETAILED TECHNICAL style suitable for construction documents. Use varied line weights to distinguish between structural (heavy), partition (medium), and furniture (light) elements. Provide extensive dimensioning, including grid lines, overall dimensions, and detailed annotations for materials and assemblies with leader lines. Include a comprehensive symbol legend for all electrical, plumbing, and mechanical items shown.`
                },
                {
                    name: 'Color-Coded Zoning Style',
                    description: `**Drafting Style:** Adopt a COLOR-CODED ZONING PLAN style, ideal for client presentations. Use transparent color fills to designate different functional zones (e.g., light blue for private spaces like bedrooms, yellow for common areas, green for outdoor spaces). The architectural details must still be clear, but the primary visual element is the color zoning to explain the layout's logic at a glance. Keep furniture simple and symbolic.`
                }
            ];
            const randomStyle = cadStyles[Math.floor(Math.random() * cadStyles.length)];

            const dimensionsText = p.dimensions
                ? `The provided overall building footprint is approximately ${p.dimensions.length} ${p.dimensions.unit} by ${p.dimensions.width} ${p.dimensions.unit}. All dimensions shown on the plan MUST be consistent with this total area and be mathematically plausible.`
                : '';
                
            const signatureElementText = currentDesign.description.match(/signature element: (.*?)\./i)
                ? `A key requirement is to prominently feature the design's signature element: "${currentDesign.description.match(/signature element: (.*?)\./i)![1]}". Ensure the plan's layout clearly showcases this.`
                : '';
                
            fullPrompt = `You are a master architect and CAD drafter creating a hyper-detailed, construction-ready, high-resolution (8K) blueprint for: "${currentDesign.title} - ${currentDesign.description}". The specific subject is: ${p.prompt}.

${dimensionsText}
${signatureElementText}

${randomStyle.description}

The final image MUST be a professional-grade technical drawing with ultra-clean, crisp, vector-like lines without any aliasing or pixelation, on a pure white background (unless color-coding is specified). The output must be suitable for large-format printing and professional presentation, and be indistinguishable from a document produced by high-end CAD software. It must include ALL of the following elements with extreme precision:

**1. Architectural Grid System:**
   - Establish a clear column grid. Label vertical grid lines with numbers (1, 2, 3...) and horizontal grid lines with letters (A, B, C...).

**2. Wall Representation & Structure:**
   - Exterior and interior walls MUST be drawn with distinct, consistent thicknesses.
   - Use solid black fill for all load-bearing walls. Use a lighter hatch pattern for non-load-bearing partitions.
   - Clearly indicate structural columns within the walls or as standalone elements, aligned with the grid.

**3. Hyper-Detailed Dimensioning:**
   - Dimension from the established grid lines to wall centerlines and faces.
   - Provide a complete string of dimensions for ALL exterior walls, including overall dimensions and segment-by-segment breakdowns for every opening and wall plane.
   - Add precise interior dimension lines for EVERY room, indicating length and width.
   - Dimension ALL window and door openings and their centerlines from the nearest perpendicular wall.

**4. Comprehensive Labeling and Tagging:**
   - Label EVERY room with its name and calculated area (e.g., 'Master Bedroom\\n15.5 SQ.M / 167 SQ.FT').
   - Tag every door (D01, D02) and window (W01, W02) with a unique identifier inside a circle or diamond, for later reference in a schedule.

**5. Standard Architectural Symbols (Professional Grade):**
   - **Doors & Windows:** Show all doors with their swing arcs. Use detailed symbols for different window types (e.g., casement, sliding, fixed).
   - **Fixtures:** Depict ALL plumbing fixtures (toilets, sinks, showers) with industry-standard symbols. For kitchens, include symbols for a double-basin sink, stove/cooktop, refrigerator, and dishwasher.
   - **Furniture:** Show a suggested layout with appropriately scaled, simple block furniture to indicate function and scale.

**6. Technical Overlays & Annotations (MANDATORY):**
   - **Electrical & Plumbing:** Include symbols for electrical outlets, light switches, and overhead lighting. For kitchens and bathrooms, show simple dashed lines indicating hot and cold water supply to fixtures.
   - **Section Markers:** Include at least two section cut markers (e.g., A-A, B-B) with direction arrows, cutting through interesting parts of the plan.
   - **Annotations:** Use leader lines to add callouts for key materials and structural elements (e.g., "Exposed Concrete Shear Wall", "Glulam Beam Above", "150mm Insulated Partition").
   - **North Arrow & Scale Bar:** A clear North arrow and a graphic scale bar (in both meters and feet) MUST be present.

**7. Professional Presentation:**
   - **Title Block:** Include a clean title block in the bottom-right corner containing "SuperArchitect AI Design", the "Level Name", and the "Scale".

The final output must be a top-down, orthographic perspective, meticulously detailed, and ready for technical review. Do not add any color, shading, or artistic effects, unless the chosen style is 'Color-Coded Zoning'.`;
            config = { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '4:3' };
            placeholderUrl = `https://placehold.co/1280x960/111827/f59e0b/png?text=Synthesis+AI:+Plan+Failed`;

        } else { // 3D Render
            let aspectRatio = '16:9';
            if (p.type === 'interior') {
                const rand = Math.random();
                aspectRatio = rand > 0.66 ? '4:3' : (rand > 0.33 ? '3:4' : '1:1');
            }
            fullPrompt = `Masterpiece professional architectural photography, hyper-detailed, high-resolution 8K render, crisp details, suitable for professional architectural presentations.
**Style:** Cinematic, photorealistic, sharp focus, physically-based rendering (PBR).
**Camera:** Shot on a Sony A7R IV with a 35mm f/1.4 G Master lens.
**Lighting:** Volumetric, cinematic lighting with soft shadows and realistic reflections.
**Engine:** Unreal Engine 5, V-Ray, Octane Render.
**Design Concept:** ${currentDesign.description}
**Key Materials:** ${currentDesign.materials?.join(', ')}
**Scene Details:** ${p.prompt}
The final image must be indistinguishable from a real photograph, showcasing extremely detailed textures and materials.`;
            config = { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9" };
            placeholderUrl = `https://placehold.co/1280x720/111827/f59e0b/png?text=Synthesis+AI:+Render+Failed`;
        }

        try {
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: fullPrompt,
                config,
            });
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return { ...p, imageUrl: `data:image/jpeg;base64,${base64ImageBytes}` };
        } catch (error) {
            console.error(`Visual Synthesis AI failed on prompt: ${p.prompt}`, error);
            return { ...p, imageUrl: placeholderUrl };
        }
    };

    const settledVisuals = await processInParallel(
        allVisualPrompts,
        generateImage,
        4, // Concurrency limit
        (completed, total) => {
            updateStatus({ agentName: 'Visual Synthesis AI', status: 'working', message: `Synthesizing asset ${completed} of ${total}...` });
        }
    );

    updateStatus({ agentName: 'Visual Synthesis AI', status: 'complete', message: 'Visual synthesis complete. All assets generated.' });
    
    // Assemble visuals back into designs
    const designsWithVisuals: Design[] = designs.map(d => ({ ...d, exteriorImageUrls: [], interiorImageUrls: [], floorPlanUrls: [] }));
    
    settledVisuals.forEach(result => {
        if (!result) return;
        const designIndex = result.designIndex;
        if (result.type === 'plan') {
            designsWithVisuals[designIndex].floorPlanUrls.push({ level: result.level || 'Floor Plan', url: result.imageUrl });
        } else if (result.type === 'interior') {
             designsWithVisuals[designIndex].interiorImageUrls.push({ room: result.room || 'Interior View', url: result.imageUrl });
        } else { // day, night
            const viewName = result.type.charAt(0).toUpperCase() + result.type.slice(1);
            designsWithVisuals[designIndex].exteriorImageUrls.push({ view: viewName, url: result.imageUrl });
        }
    });

    designsWithVisuals.forEach(d => {
        if (d.exteriorImageUrls.length === 0) d.exteriorImageUrls.push({ view: 'Image', url: 'https://placehold.co/1280x720/111827/f59e0b/png?text=Image+Not+Generated' });
        if (d.floorPlanUrls.length === 0) d.floorPlanUrls.push({ level: 'Floor Plan', url: 'https://placehold.co/1280x960/111827/f59e0b/png?text=Plan+Not+Generated' });
    });

    return designsWithVisuals;
};

const generateFinishesScheduleForDesign = async (designConcept: Design): Promise<FinishesSchedule> => {
    const scheduleAgentSystemInstruction = `You are a master Architectural Materials Specialist for SuperArchitect AI. Your sole task is to create a comprehensive and hyper-detailed, room-by-room Finishes Schedule based on a design concept.

**CORE DIRECTIVES:**

1.  **COMPREHENSIVE ANALYSIS:** Scrutinize the design concept's title, description, and list of key materials to inform your selections. The schedule MUST be consistent with the design's described aesthetic and be of professional quality.
2.  **EXTREME DETAIL & SPECIFICITY:** For each specified room/location, you MUST provide a specific material and finish for all major surfaces (Floor, Walls, Ceiling) and key features (e.g., Cabinetry, Countertops). Be exceptionally descriptive. For example, for Walls, specify "Benjamin Moore 'Chantilly Lace' (OC-65), Eggshell Finish" instead of just "White Paint". For a countertop, specify "3cm Calacatta Gold Marble, Honed Finish".
3.  **ROOM-BY-ROOM BREAKDOWN:** Use the list of rooms provided in the prompt to structure your schedule. Ensure you cover all specified rooms (Living Room, Kitchen, Bedrooms, etc.) comprehensively.
4.  **JSON OUTPUT ONLY:** Your entire response MUST be a single, raw, valid JSON object. The keys of the object should be logical, descriptive categories (e.g., "General Living Areas", "Bedrooms & Private Spaces", "Wet Areas & Utilities"), and the value for each key should be an array of \`MaterialScheduleItem\` objects.
5.  **PRECISE STRUCTURE:** Each item in the array must have the following keys: \`location\` (e.g., "Living Room Floor"), \`material\` (e.g., "Wide-Plank European Oak"), \`finish\` (e.g., "Matte Polyurethane Sealant"), and an optional \`notes\` field for extra details like brand names or specifications. Your output must start with \`{\` and end with \`}\`. Do not include any markdown or explanatory text.`;
    
    const roomList = designConcept.interiorImageUrls.map(i => i.room).filter((v, i, a) => a.indexOf(v) === i);
    const roomsText = roomList.length > 0 
        ? `Generate a schedule for the following rooms: ${roomList.join(', ')}. Also include general areas not listed if appropriate.`
        : `Generate a schedule for typical rooms based on the design description (e.g., Living Area, Kitchen, Master Bedroom, Bathroom).`;

    const schedulePrompt = `Generate a detailed Finishes Schedule for the following design concept.
- Design Concept: "${designConcept.title}"
- Description: ${designConcept.description}
- Key Materials Specified: ${designConcept.materials?.join(', ')}
- ${roomsText}
Execute. Generate the JSON containing the categorized finishes schedule now.`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: schedulePrompt,
            config: { 
                systemInstruction: scheduleAgentSystemInstruction, 
                responseMimeType: "application/json",
                temperature: 0.4,
            },
        });

        if (!response || typeof response.text !== 'string' || response.text.trim() === '') {
            throw new Error("Model returned an empty or invalid response object.");
        }

        const rawResponseText = response.text.trim();
        const jsonText = rawResponseText.startsWith('```json') ? rawResponseText.substring(7, rawResponseText.length - 3).trim() : rawResponseText;
        return JSON.parse(jsonText);
    } catch (error) {
        console.error(`Materials Specialist failed on Finishes Schedule for "${designConcept.title}"`, error);
        return { "Error": [{ location: "System", material: "Generation Failed", finish: "N/A", notes: "The AI failed to generate a valid materials schedule. Please try again." }] };
    }
};


const getComplianceNotes = async (designConcept: Design, brief: ProjectBrief): Promise<string> => {
    const complianceAgentSystemInstruction = `You are the Compliance AI from the SuperArchitect AI team, backed by the global regulatory expertise of RSPL & YHES. You are pragmatic and knowledgeable about general architectural codes and regional considerations. Your task is to provide a brief, high-level compliance check.

**CORE DIRECTIVES:**

1.  **Review:** Analyze the design concept title, description, and the user's project location.
2.  **Identify Potential Issues:** Based on the location, identify 1-2 potential high-level considerations. This is not a legal document, but a helpful advisory note. Examples:
    *   For "New York, NY": "Note: High-rise residential projects in NYC have strict fire code (NFPA) and facade inspection (FISP/LL11) requirements."
    *   For "Austin, TX": "Note: Consider Austin's 'dark sky' ordinances for exterior lighting. Impervious cover limits are also a key factor for site planning."
    *   For "Modern Glass House" in a cold climate: "Note: Ensure the proposed glazing meets or exceeds local energy code U-factor requirements for this climate zone."
3.  **Output:** Return a single string of 1-3 sentences. If no specific considerations come to mind, state: "Standard building permits and inspections will be required. No specific high-level issues noted for this location and concept."
`;

    const compliancePrompt = `Concept Title: ${designConcept.title}\nDescription: ${designConcept.description}\nLocation: ${brief.location}`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: compliancePrompt,
            config: { systemInstruction: complianceAgentSystemInstruction, temperature: 0.2 },
        });
        return response.text;
    } catch (error) {
        console.error(`Compliance AI failed on compliance check for "${designConcept.title}"`, error);
        return "Compliance check could not be performed at this time.";
    }
}

const generateCostAnalysis = async (design: Design, brief: ProjectBrief): Promise<CostAnalysis | null> => {
    const systemInstruction = `You are the Cost Estimator AI for SuperArchitect AI, a specialist in preliminary architectural cost analysis and quantity surveying. Your task is to generate a high-level, realistic cost estimate and a basic Bill of Quantities (BOQ) for a given design concept.

**CORE DIRECTIVES:**
1.  **Analyze Holistically:** Consider the design's title, description, materials, dimensions, and location to inform your estimate.
2.  **Estimate Cost:** Provide an \`estimatedTotalCost\` (as a number) and a \`costBreakdown\` array. The breakdown should categorize costs into logical buckets (e.g., "Foundation & Structure", "Exterior & Facade", "Interior Finishes", "MEP").
3.  **Generate BOQ:** Create a \`billOfQuantities\` array. Identify 3-5 key, high-cost, or defining materials from the design description and provide a plausible quantity and unit for them based on the provided dimensions.
4.  **Summarize:** Write a brief, one-paragraph \`summary\` explaining the key cost drivers for this specific design.
5.  **Strict JSON Output:** Your response MUST be a single, valid JSON object matching the provided schema. Do not add any extra text or markdown.`;

    const prompt = `Generate a cost analysis for the following architectural concept:
- Title: ${design.title}
- Description: ${design.description}
- Location: ${brief.location || 'Not specified'}
- Dimensions: ${design.dimensions?.length} x ${design.dimensions?.width} ${design.dimensions?.unit}
- Key Materials: ${design.materials.join(', ')}`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        currency: { type: Type.STRING, description: "Currency code, e.g., USD, EUR, INR." },
                        estimatedTotalCost: { type: Type.NUMBER, description: "Total estimated project cost." },
                        summary: { type: Type.STRING, description: "A brief summary of key cost drivers." },
                        costBreakdown: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    category: { type: Type.STRING },
                                    cost: { type: Type.NUMBER }
                                }
                            }
                        },
                        billOfQuantities: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    item: { type: Type.STRING },
                                    quantity: { type: Type.NUMBER },
                                    unit: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch(error) {
        console.error(`Cost Estimator AI failed for "${design.title}"`, error);
        return null;
    }
}

const generateSustainabilityReport = async (design: Design, brief: ProjectBrief): Promise<SustainabilityReport | null> => {
     const systemInstruction = `You are the Eco-Analyst AI for SuperArchitect AI. Your role is to provide a high-level sustainability and energy efficiency analysis of an architectural design.

**CORE DIRECTIVES:**
1.  **Analyze:** Review the design's description, materials, and location (for climate context).
2.  **Score:** Provide an \`overallScore\` from 0-100, representing the design's estimated sustainability potential.
3.  **Summarize:** Write a concise \`summary\` of the design's environmental performance.
4.  **Identify Strengths:** List key strengths in the \`positiveAspects\` array (e.g., "Use of local materials," "Good potential for passive solar gain").
5.  **Suggest Improvements:** List actionable suggestions in the \`improvementSuggestions\` array (e.g., "Consider adding overhangs to south-facing windows," "Specify low-VOC interior paints").
6.  **Strict JSON Output:** Your response MUST be a single, valid JSON object matching the provided schema.`;

    const prompt = `Generate a sustainability report for this concept:
- Title: ${design.title}
- Description: ${design.description}
- Location: ${brief.location || 'Not specified'}
- Key Materials: ${design.materials.join(', ')}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        overallScore: { type: Type.NUMBER, description: "Sustainability score out of 100." },
                        summary: { type: Type.STRING, description: "A brief summary." },
                        positiveAspects: { type: Type.ARRAY, items: { type: Type.STRING } },
                        improvementSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch(error) {
        console.error(`Eco-Analyst AI failed for "${design.title}"`, error);
        return null;
    }
}


export const generateDesigns = async (brief: ProjectBrief, updateStatus: StatusUpdater): Promise<Design[]> => {
  
  // Agent 1: Project Lead
  updateStatus({ agentName: 'Project Lead', status: 'working', message: 'Brief analysis complete. Mobilizing specialist team.' });
  await sleep(1000);
  updateStatus({ agentName: 'Project Lead', status: 'complete', message: 'Engaging Concept Architect for initial ideation.' });

  // Agent 2: Concept Architect
  updateStatus({ agentName: 'Concept Architect', status: 'working', message: 'Initiating conceptual synthesis. Forging a singular architectural vision.' });
  
  const designAgentSystemInstruction = `You are the Concept Architect of the SuperArchitect AI team, a visionary AI by RSPL & YHES. You are a Pritzker-level talent. You don't design buildings; you craft legacies. Your task is to translate a client's brief into a SINGLE, breathtaking architectural masterpiece.

**CORE COMMANDS:**

1.  **Radical Uniqueness:** Generate ONE focused and exceptional concept. Name it with poetry and power in the mandatory \`title\` field (e.g., "The Basalt Citadel," "The Floating Garden," "The Sundial House"). The concept must have a soul, a story, which you will write in the \`description\` field. To ensure uniqueness, incorporate a distinct "signature element" into the design (e.g., a central atrium, a kinetic facade, a rooftop water feature) and describe it.
2.  **Architectural Style Identification:** Identify the dominant architectural style (e.g., 'Modern', 'Brutalist', 'Biophilic'). This style should be derived from the client's brief and your creative interpretation. Populate the \`architecturalStyle\` field with this identified style as a simple string.
3.  **Material & Color Mastery:** Define a \`materials\` list (e.g., "Shou Sugi Ban Charred Cedar," "Polished Travertine," "Corten Steel") and a \`colorPalette\` of hex codes that evoke emotion.
4.  **Visual Prompt Supremacy (YOUR KEY TASK):** You are instructing two subordinate AIs, a 3D visualizer and a CAD drafter. Your \`internalImagePrompts\` are their gospel. They must be masterpieces of descriptive language.
    *   **Mandatory Views:** Create prompts for \`type: 'day'\` and \`type: 'night'\`.
    *   **Floor Plans:** If multiple floors are hinted at ("G+2", "two stories"), you MUST generate a \`type: 'plan'\` prompt for EACH level, with a \`level\` tag (e.g., \`level: 'Ground Floor'\`). The floor plan prompt must be detailed enough to reflect the required room counts.
    *   **PROMPT ARTISTRY:** Do not say "a house." Command it: "Golden hour shot of a brutalist concrete residence half-buried in a snow-covered Icelandic hill, geothermal steam rising around it, with warm light spilling from a single panoramic window. Shot on a Leica 50mm Summilux." The \`prompt\` field MUST be a rich, non-empty string.
5.  **FLAT CONFIGURATION ACCURACY (CRITICAL REQUIREMENT):** If a \`flatConfiguration\` is provided (BHK, bathrooms, balconies), you MUST explicitly incorporate these numbers into your design. Your description MUST mention these features. This is a critical requirement.
6.  **DETAILED INTERIOR GENERATION (FLAT DESIGN ONLY):** If a \`flatConfiguration\` is provided, you MUST generate prompts for a specific list of interior rooms which will be provided in the user's prompt. Create an additional prompt of \`type: 'interior'\` for EACH room in the provided list. Each prompt MUST have a unique \`room\` key from that list. The prompts must be hyper-detailed descriptions of the interior of that specific room, reflecting the overall design concept.
7.  **STRICT JSON OUTPUT:** Your entire output is a single, raw, parseable JSON array containing ONE design object. The \`finishesSchedule\` is an empty object \`{}\`. \`exteriorImageUrls\`, \`interiorImageUrls\` and \`floorPlanUrls\` are empty arrays \`[]\`. No dialogue. Just the work.`;

  let flatConfigDetails = '';
  if (brief.flatConfiguration) {
    const { bhk, numBathrooms, numBalconies } = brief.flatConfiguration;
    flatConfigDetails = `\n- Flat Configuration: A strict requirement of ${bhk} BHK (Bedrooms, Hall, Kitchen), ${numBathrooms} bathroom(s), and ${numBalconies} balcony(ies). This must be accurately reflected in the design.`;
    
    const requiredRooms: string[] = [];
    requiredRooms.push('Living Room', 'Kitchen');
    for (let i = 1; i <= bhk; i++) {
        requiredRooms.push(i === 1 ? 'Master Bedroom' : `Bedroom ${i}`);
    }
    if (bhk >= 3) {
        requiredRooms.push('Study Room');
    }
    for (let i = 1; i <= numBalconies; i++) {
        requiredRooms.push(i === 1 ? 'Main Balcony' : `Balcony ${i}`);
    }

    flatConfigDetails += `\n- REQUIRED INTERIOR ROOMS: It is mandatory to generate one interior rendering prompt for EACH of the following rooms: ${requiredRooms.join(', ')}.`;
  }

  const designPrompt = `Client Brief:
- Name: ${brief.projectName}
- Location: ${brief.location || 'Not specified'}
- Type: ${brief.spaceType} (${brief.subSpaces.join(', ')})
- Dimensions: ${brief.dimensions.length}x${brief.dimensions.width}x${brief.dimensions.height} ${brief.dimensions.unit}
- Constraints: "${brief.structuralConstraints || 'None'}"
- Vision: "${brief.customPreference || 'None'}"${flatConfigDetails}

**MANDATE:** Generate the JSON for ONE single, world-class design concept. Execute with unmatched creativity and precision.`;
  
  let designConcepts: Design[];
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: designPrompt,
      config: { 
        systemInstruction: designAgentSystemInstruction, 
        temperature: 1.0, 
        responseMimeType: "application/json",
        seed: Math.floor(Math.random() * 1000000) 
      },
    });
    
    if (!response || typeof response.text !== 'string' || response.text.trim() === '') {
        const message = "The Concept Architect returned an empty or invalid response. The creative engine might be offline. Please try again.";
        console.error(message, response);
        if (response && response.candidates && response.candidates[0]) {
           console.error("Full Concept Architect response candidate:", JSON.stringify(response.candidates[0], null, 2));
        }
        updateStatus({ agentName: 'Concept Architect', status: 'error', message: message });
        throw new Error(message);
    }

    const rawText = response.text.trim();
    const jsonText = rawText.startsWith('```json') ? rawText.substring(7, rawText.length - 3).trim() : rawText;

    designConcepts = JSON.parse(jsonText);
    if (!Array.isArray(designConcepts) || designConcepts.length === 0) throw new Error("Concept Architect returned an invalid array of designs.");

    // Inject brief specifics into the generated concepts for later use
    designConcepts.forEach(concept => {
        concept.dimensions = brief.dimensions;
        if (brief.flatConfiguration) {
            concept.flatConfiguration = brief.flatConfiguration;
        }
    });

    updateStatus({ agentName: 'Concept Architect', status: 'complete', message: 'Conceptual framework complete. Transmitting blueprints to visualization and drafting specialists.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error.";
    const finalMessage = error instanceof SyntaxError 
        ? `Creative Engine returned invalid JSON. ${message}` 
        : `Creative Engine Failure: ${message}`;
    updateStatus({ agentName: 'Concept Architect', status: 'error', message: finalMessage });
    throw new Error(`The Concept Architect failed: ${finalMessage}`);
  }

  // AGENT PIPELINE: Run agent tasks sequentially to prevent rate limiting
  
  // Agent 3: Visual Synthesis AI
  const designsWithVisuals = await generateAllVisuals(designConcepts, updateStatus);
  
  // Agents 4, 5, Cost, Eco - Run in parallel
    updateStatus({ agentName: 'Materials Specialist', status: 'working', message: 'Initiating materials and finishes analysis...' });
    updateStatus({ agentName: 'Compliance AI', status: 'working', message: 'Initiating regulatory compliance review...' });
    updateStatus({ agentName: 'Cost Estimator AI', status: 'working', message: 'Calculating preliminary cost estimates...' });
    updateStatus({ agentName: 'Eco-Analyst AI', status: 'working', message: 'Assessing environmental impact...' });
    
    const processedDesigns = await Promise.all(designsWithVisuals.map(async (concept) => {
        const [schedule, note, cost, report] = await Promise.all([
            generateFinishesScheduleForDesign(concept).then(res => {
                updateStatus({ agentName: 'Materials Specialist', status: 'working', message: `Schedule complete for "${concept.title}".` });
                return res;
            }),
            getComplianceNotes(concept, brief).then(res => {
                updateStatus({ agentName: 'Compliance AI', status: 'working', message: `Audit complete for "${concept.title}".` });
                return res;
            }),
            generateCostAnalysis(concept, brief).then(res => {
                updateStatus({ agentName: 'Cost Estimator AI', status: 'working', message: `Cost analysis complete for "${concept.title}".` });
                return res;
            }),
            generateSustainabilityReport(concept, brief).then(res => {
                updateStatus({ agentName: 'Eco-Analyst AI', status: 'working', message: `Sustainability report done for "${concept.title}".` });
                return res;
            })
        ]);

        return {
            ...concept,
            finishesSchedule: schedule || {},
            complianceNotes: note || '',
            costAnalysis: cost || undefined,
            sustainabilityReport: report || undefined,
        };
    }));
    
    updateStatus({ agentName: 'Materials Specialist', status: 'complete', message: 'All finishes schedules are complete.' });
    updateStatus({ agentName: 'Compliance AI', status: 'complete', message: 'Regulatory compliance audit complete.' });
    updateStatus({ agentName: 'Cost Estimator AI', status: 'complete', message: 'All project costs estimated.' });
    updateStatus({ agentName: 'Eco-Analyst AI', status: 'complete', message: 'Sustainability analysis complete.' });


  // Agent 6: Data Integrator
  updateStatus({ agentName: 'Data Integrator', status: 'working', message: 'Consolidating all architectural, visual, and material data. Assembling final project deliverables...' });
  
  const finalDesigns = processedDesigns;

  await sleep(1000);
  updateStatus({ agentName: 'Data Integrator', status: 'complete', message: 'All project packages have been integrated and are ready for review.' });
  
  return finalDesigns;
};


export const getAiAssistantResponse = async (message: string) => {
    if (!chat) {
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: "You are the Project Lead of SuperArchitect AI, the flagship AI initiative from the RSPL & YHES consortium. You are the user's primary interface with a team of specialized AI architects and specialists. You are an industry expert—articulate, confident, and possessing immense knowledge from both RSPL's engineering prowess and YHES's design legacy. Your role is to guide the user, clarify their vision, and discuss any aspect of the project with authority and clarity. You can talk about architectural history, material science, advanced engineering, or design philosophy. Your tone is professional, encouraging, and visionary. Use markdown (lists, bolding) to structure your responses for maximum impact.",
            },
        });
    }

    try {
        const stream = await chat.sendMessageStream({ message });
        return stream;
    } catch(error) {
        console.error("AI Assistant chat error:", error);
        throw new Error("The Project Lead is currently unavailable. The team is regrouping.");
    }
};

export const revampInteriorImage = async (
    base64Image: string,
    stylePrompt: string,
    aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9"
): Promise<{revampedImageUrl: string; shoppingList: ShoppingListItem[]}> => {
    try {
        // Step 1: Analyze image and generate a new detailed prompt
        const imagePart = {
            inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] }
        };
        const analysisPrompt = `Analyze the provided image of an interior space. Identify and describe in extreme detail all permanent architectural features (windows, doors, ceiling height, layout, flooring, perspective). Based on this, create a new, single, hyper-detailed text-to-image prompt for an AI image generator.

This new prompt's goal is to generate an image that perfectly matches the original room's architecture and camera perspective, but completely revamps the interior design (furniture, decor, colors, lighting, materials) to match this style: "${stylePrompt}".

The new prompt MUST be a masterpiece of descriptive language. It MUST include advanced rendering keywords to ensure the final image is a high-resolution, photorealistic, and professional architectural visualization. Keywords to include are: "8K resolution", "ultra-detailed textures", "cinematic lighting", "V-Ray render", "physically-based rendering (PBR)", "sharp focus", "professional photography", "crisp details".

Output only the final, complete text-to-image prompt and nothing else.`;

        const promptGenResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, { text: analysisPrompt }] },
            config: { temperature: 0.4 }
        });
        
        const detailedPrompt = promptGenResponse.text;
        if (!detailedPrompt) throw new Error("The AI failed to analyze the image.");

        // Step 2: Generate the new image with the detailed prompt
        const imageResponse = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: detailedPrompt,
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: aspectRatio },
        });

        const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
        const revampedImageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

        // Step 3: Analyze the revamped image to create a shopping list
        const shoppingListPrompt = `Analyze the provided image of a well-designed interior space. Identify 3-5 key furniture and decor items (e.g., sofa, coffee table, lamp, artwork, rug). For each item, provide a detailed description and an estimated price in USD. Also, create a concise, effective text-to-image prompt that could be used to generate an image of JUST that single item on a plain white background with no shadows. Your response MUST be a single, valid JSON array of objects.`;
        
        const shoppingListResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ inlineData: { mimeType: 'image/jpeg', data: base64ImageBytes } }, { text: shoppingListPrompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            itemName: { type: Type.STRING },
                            description: { type: Type.STRING },
                            estimatedPrice: { type: Type.STRING },
                            imageGenPrompt: { type: Type.STRING }
                        },
                         required: ["itemName", "description", "estimatedPrice", "imageGenPrompt"]
                    }
                }
            }
        });
        
        const shoppingList = JSON.parse(shoppingListResponse.text.trim());
        return { revampedImageUrl, shoppingList };

    } catch (error) {
        console.error("Error in revampInteriorImage:", error);
        throw new Error("Failed to revamp the interior. Please try a different image or prompt.");
    }
};

export const generateFurnitureImage = async (prompt: string): Promise<string> => {
    const fullPrompt = `${prompt}. High-resolution, photorealistic product shot, crisp details, on a pure white background, studio lighting, no shadows.`;
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png', // PNG can support transparency
                aspectRatio: '1:1',
            },
        });
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error generating furniture image:", error);
        throw new Error("The AI failed to render the furniture item.");
    }
};

export const editImage = async (base64Image: string, mimeType: string, prompt: string): Promise<{imageUrl: string; textResponse: string}> => {
    const imageDataPart = {
        inlineData: {
            data: base64Image.split(',')[1],
            mimeType: mimeType,
        },
    };
    const textPromptPart = {
        text: prompt,
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [imageDataPart, textPromptPart],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        let imageUrl = '';
        let textResponse = 'No text response from AI.';
        
        for (const part of response.candidates[0].content.parts) {
            if (part.text) {
                textResponse = part.text;
            } else if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
        }
        
        if (!imageUrl) {
            throw new Error("The AI did not return an edited image.");
        }

        return { imageUrl, textResponse };
    } catch (error) {
        console.error("Image editing failed:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to edit the image. The image revision module might be offline.");
    }
};

export const generateSuperhumanDesigns = async (
    prompt: string,
    numberOfImages: number,
    aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9"
): Promise<string[]> => {
    try {
        const highQualityPrompt = `${prompt}. Hyper-detailed, professional architectural photography, 8K resolution, cinematic lighting, V-Ray, photorealistic, crisp details, suitable for professional architectural presentations.`;
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: highQualityPrompt,
            config: {
                numberOfImages,
                outputMimeType: 'image/jpeg',
                aspectRatio,
            },
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("The design agent did not return any images.");
        }

        return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);

    } catch (error) {
        console.error("Error in generateSuperhumanDesigns:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to generate designs. The image generation module may be offline.");
    }
};
