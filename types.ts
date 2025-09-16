

export enum DimensionUnit {
  METERS = 'meters',
  FEET = 'feet',
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: DimensionUnit;
}

export interface FlatConfiguration {
    bhk: number;
    numBathrooms: number;
    numBalconies: number;
}

export interface ProjectBrief {
  projectName: string;
  spaceType: string;
  subSpaces: string[];
  customPreference: string;
  
  dimensions: Dimensions;

  structuralConstraints: string;
  
  location?: string; // For compliance checks

  flatConfiguration?: FlatConfiguration;
}

export interface MaterialScheduleItem {
    location: string; // e.g., 'Living Room Walls', 'Kitchen Floor'
    material: string;
    finish: string;
    notes?: string;
}

export interface FinishesSchedule {
    [category: string]: MaterialScheduleItem[]; // e.g., category: 'Flooring', 'Walls'
}

export interface BillOfQuantitiesItem {
    item: string;
    quantity: number;
    unit: string;
}

export interface CostAnalysis {
    currency: string;
    estimatedTotalCost: number;
    costBreakdown: { category: string; cost: number; }[];
    billOfQuantities: BillOfQuantitiesItem[];
    summary: string;
}

export interface SustainabilityReport {
    overallScore: number; // e.g., out of 100
    summary: string;
    positiveAspects: string[];
    improvementSuggestions: string[];
}

// For Virtual Try-On Feature
export interface ShoppingListItem {
    itemName: string;
    description: string;
    estimatedPrice: string;
    imageGenPrompt: string; // Prompt to generate an image of just this item
    imageUrl?: string; // To cache the generated image
    isGenerating?: boolean;
}

export interface PlacedItem {
    id: string; // unique id for the item instance
    shoppingItem: ShoppingListItem;
    x: number; // percentage
    y: number; // percentage
    width: number; // pixels
    height: number; // pixels
    rotation: number; // degrees
}


export interface Design {
  title: string;
  description:string;
  architecturalStyle?: string;
  
  // REPLACES `imageUrls` for better organization
  exteriorImageUrls: { view: string; url: string; }[]; // e.g., view: 'Day', 'Night'
  interiorImageUrls: { room: string; url: string; }[]; // e.g., room: 'Living Room', 'Kitchen'

  floorPlanUrls: { level: string; url: string; }[]; // e.g., level: 'Ground Floor', 'First Floor'
  
  // UPDATED: Now includes a `room` key for interior types to guide generation
  internalImagePrompts: {
      type: 'day' | 'night' | 'interior' | 'plan';
      prompt: string;
      level?: string; // Only for 'plan' type
      room?: string; // Only for 'interior' type
  }[];
  
  materials: string[];
  colorPalette: string[];
  finishesSchedule: FinishesSchedule;
  complianceNotes?: string;

  // Added for better data tracking and display
  flatConfiguration?: FlatConfiguration;
  dimensions?: Dimensions;
  
  // New Features
  costAnalysis?: CostAnalysis;
  sustainabilityReport?: SustainabilityReport;
}

// New type for agent status updates
export interface AgentStatus {
    agent: string;
    role: string;
    status: 'pending' | 'working' | 'complete' | 'error';
    message: string;
}

// Main application view state
export type View = 'architecture' | 'interior' | 'agents' | 'inspiration' | 'designer';