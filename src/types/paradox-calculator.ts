// Paradox Magellan Calculator Types

export type SystemType = 'wireless' | 'hardwired';

export type PropertyType = 'house-double' | 'house-single' | 'apartment' | 'office';

export type PropertySize = 'small' | 'medium' | 'large' | 'very-large';

export type ProductCategory = 
  | 'panel' 
  | 'keypad' 
  | 'remote' 
  | 'motion-indoor' 
  | 'motion-outdoor' 
  | 'door-contact' 
  | 'siren' 
  | 'smoke' 
  | 'specialty' 
  | 'accessory';

export interface Product {
  id: string;
  code: string;
  name: string;
  category: ProductCategory;
  description: string;
  fullDescription: string;
  features: string[];
  whenToUse: string;
  zones: number;
  systemTypes: SystemType[];
  tooltip: string;
  petFriendly?: boolean;
  maxPetWeight?: number;
  range?: number;
  isRequired?: boolean;
  isInformationalOnly?: boolean;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface PetInfo {
  hasPets: boolean;
  largestWeight?: number;
}

export interface OutdoorCoverage {
  wantsOutdoor: boolean;
}

export interface PropertyInfo {
  type: PropertyType;
  size: PropertySize;
  floors: number;
  hasGarageOrMetalDoors: boolean;
}

export interface CalculatorState {
  currentStep: number;
  systemType: SystemType;
  propertyInfo: PropertyInfo;
  petInfo: PetInfo;
  outdoorCoverage: OutdoorCoverage;
  cart: CartItem[];
  zonesUsed: number;
  maxZones: number;
  validationErrors: string[];
}

export interface UserInfo {
  name: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
}

export const CALCULATOR_STEPS = [
  { id: 1, name: 'Property', shortName: 'Type' },
  { id: 2, name: 'Control Panel', shortName: 'Panel' },
  { id: 3, name: 'Keypads', shortName: 'Keypads' },
  { id: 4, name: 'Remotes', shortName: 'Remotes' },
  { id: 5, name: 'Indoor Motion', shortName: 'Motion' },
  { id: 6, name: 'Outdoor Motion', shortName: 'Outdoor' },
  { id: 7, name: 'Door Contacts', shortName: 'Contacts' },
  { id: 8, name: 'Sirens', shortName: 'Sirens' },
  { id: 9, name: 'Smoke Detectors', shortName: 'Smoke' },
  { id: 10, name: 'Accessories', shortName: 'Extras' },
  { id: 11, name: 'Review Quote', shortName: 'Review' },
] as const;

export const MAX_ZONES = 32;
