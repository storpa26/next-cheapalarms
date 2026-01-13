import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  CalculatorState, 
  CartItem, 
  Product, 
  PropertyType, 
  PropertySize, 
  SystemType,
  PetInfo,
  OutdoorCoverage,
  MAX_ZONES 
} from '../types/paradox-calculator';
import { getProductById } from '../data/paradox-products';

interface CalculatorContextType {
  state: CalculatorState;
  // Navigation
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  // System type
  setSystemType: (type: SystemType) => void;
  // Property info
  setPropertyType: (type: PropertyType) => void;
  setPropertySize: (size: PropertySize) => void;
  setFloors: (floors: number) => void;
  setHasGarageOrMetalDoors: (has: boolean) => void;
  // Pet info
  setPetInfo: (info: PetInfo) => void;
  // Outdoor coverage
  setOutdoorCoverage: (coverage: OutdoorCoverage) => void;
  // Cart operations
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  getCartItem: (productId: string) => CartItem | undefined;
  getCartTotal: () => number;
  // Validation
  canAddZones: (zonesToAdd: number) => boolean;
  hasPanel: () => boolean;
  hasKeypad: () => boolean;
  hasSiren: () => boolean;
  hasSmokeDetector: () => boolean;
  // Reset
  resetCalculator: () => void;
}

const initialState: CalculatorState = {
  currentStep: 1,
  systemType: 'wireless',
  propertyInfo: {
    type: 'house-single',
    size: 'medium',
    floors: 1,
    hasGarageOrMetalDoors: false,
  },
  petInfo: {
    hasPets: false,
  },
  outdoorCoverage: {
    wantsOutdoor: false,
  },
  cart: [],
  zonesUsed: 0,
  maxZones: MAX_ZONES,
  validationErrors: [],
};

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

export const CalculatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CalculatorState>(initialState);

  const calculateZonesUsed = useCallback((cart: CartItem[]): number => {
    return cart.reduce((total, item) => total + (item.product.zones * item.quantity), 0);
  }, []);

  const setStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => ({ ...prev, currentStep: Math.max(1, prev.currentStep - 1) }));
  }, []);

  const setSystemType = useCallback((type: SystemType) => {
    setState(prev => ({ ...prev, systemType: type }));
  }, []);

  const setPropertyType = useCallback((type: PropertyType) => {
    setState(prev => ({
      ...prev,
      propertyInfo: { ...prev.propertyInfo, type },
    }));
  }, []);

  const setPropertySize = useCallback((size: PropertySize) => {
    setState(prev => ({
      ...prev,
      propertyInfo: { ...prev.propertyInfo, size },
    }));
  }, []);

  const setFloors = useCallback((floors: number) => {
    setState(prev => ({
      ...prev,
      propertyInfo: { ...prev.propertyInfo, floors },
    }));
  }, []);

  const setHasGarageOrMetalDoors = useCallback((has: boolean) => {
    setState(prev => ({
      ...prev,
      propertyInfo: { ...prev.propertyInfo, hasGarageOrMetalDoors: has },
    }));
  }, []);

  const setPetInfo = useCallback((info: PetInfo) => {
    setState(prev => ({ ...prev, petInfo: info }));
  }, []);

  const setOutdoorCoverage = useCallback((coverage: OutdoorCoverage) => {
    setState(prev => ({ ...prev, outdoorCoverage: coverage }));
  }, []);

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setState(prev => {
      const existingIndex = prev.cart.findIndex(item => item.product.id === product.id);
      let newCart: CartItem[];

      if (existingIndex >= 0) {
        newCart = prev.cart.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newCart = [...prev.cart, { product, quantity }];
      }

      return {
        ...prev,
        cart: newCart,
        zonesUsed: calculateZonesUsed(newCart),
      };
    });
  }, [calculateZonesUsed]);

  const removeFromCart = useCallback((productId: string) => {
    setState(prev => {
      const newCart = prev.cart.filter(item => item.product.id !== productId);
      return {
        ...prev,
        cart: newCart,
        zonesUsed: calculateZonesUsed(newCart),
      };
    });
  }, [calculateZonesUsed]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setState(prev => {
      if (quantity <= 0) {
        const newCart = prev.cart.filter(item => item.product.id !== productId);
        return {
          ...prev,
          cart: newCart,
          zonesUsed: calculateZonesUsed(newCart),
        };
      }

      const newCart = prev.cart.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      );

      return {
        ...prev,
        cart: newCart,
        zonesUsed: calculateZonesUsed(newCart),
      };
    });
  }, [calculateZonesUsed]);

  const getCartItem = useCallback((productId: string): CartItem | undefined => {
    return state.cart.find(item => item.product.id === productId);
  }, [state.cart]);

  const getCartTotal = useCallback((): number => {
    return state.cart.reduce((total, item) => total + item.quantity, 0);
  }, [state.cart]);

  const canAddZones = useCallback((zonesToAdd: number): boolean => {
    return state.zonesUsed + zonesToAdd <= state.maxZones;
  }, [state.zonesUsed, state.maxZones]);

  const hasPanel = useCallback((): boolean => {
    return state.cart.some(item => item.product.category === 'panel');
  }, [state.cart]);

  const hasKeypad = useCallback((): boolean => {
    return state.cart.some(item => item.product.category === 'keypad');
  }, [state.cart]);

  const hasSiren = useCallback((): boolean => {
    return state.cart.some(item => item.product.category === 'siren');
  }, [state.cart]);

  const hasSmokeDetector = useCallback((): boolean => {
    return state.cart.some(item => item.product.category === 'smoke');
  }, [state.cart]);

  const resetCalculator = useCallback(() => {
    setState(initialState);
  }, []);

  const value: CalculatorContextType = {
    state,
    setStep,
    nextStep,
    prevStep,
    setSystemType,
    setPropertyType,
    setPropertySize,
    setFloors,
    setHasGarageOrMetalDoors,
    setPetInfo,
    setOutdoorCoverage,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartItem,
    getCartTotal,
    canAddZones,
    hasPanel,
    hasKeypad,
    hasSiren,
    hasSmokeDetector,
    resetCalculator,
  };

  return (
    <CalculatorContext.Provider value={value}>
      {children}
    </CalculatorContext.Provider>
  );
};

export const useCalculator = (): CalculatorContextType => {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
};
