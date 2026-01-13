"use client";

import { Product } from '../../types/paradox-calculator';
import { useCalculator } from '../../contexts/CalculatorContext';
import { Button } from '../../components/ui/button';
import { Info, Plus, Minus, AlertTriangle, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductInfoModal from './ProductInfoModal';

interface ProductCardProps {
  product: Product;
  showQuantity?: boolean;
  preSelected?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  recommended?: boolean;
  warning?: string;
}

const ProductCard = ({ 
  product, 
  showQuantity = true, 
  preSelected = false,
  disabled = false,
  disabledReason,
  recommended = false,
  warning,
}: ProductCardProps) => {
  const { getCartItem, addToCart, updateQuantity, canAddZones } = useCalculator();
  const [showModal, setShowModal] = useState(false);
  
  const cartItem = getCartItem(product.id);
  const quantity = cartItem?.quantity || 0;
  const isInCart = quantity > 0;

  const handleAdd = () => {
    if (product.zones > 0 && !canAddZones(product.zones)) return;
    addToCart(product, 1);
  };

  const handleIncrement = () => {
    if (product.zones > 0 && !canAddZones(product.zones)) return;
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrement = () => {
    updateQuantity(product.id, quantity - 1);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={!disabled ? { 
          y: -8, 
          scale: 1.02,
          transition: { duration: 0.2, ease: "easeOut" }
        } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`
          relative bg-card/80 backdrop-blur-sm rounded-xl p-5 border-2 
          overflow-hidden group
          ${isInCart ? 'border-secondary shadow-lg shadow-secondary/20' : 'border-border/50'}
          ${disabled ? 'opacity-50 pointer-events-none' : 'hover:shadow-xl hover:shadow-primary/10 cursor-pointer'}
          ${recommended ? 'ring-2 ring-primary/30 ring-offset-2 ring-offset-background' : ''}
        `}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-shimmer opacity-0 group-hover:opacity-20 pointer-events-none" />
        
        {/* Glow effect for recommended items */}
        {recommended && (
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-xl bg-primary/10 blur-xl pointer-events-none"
          />
        )}
        {/* Badges */}
        <div className="flex gap-2 mb-3 relative z-10">
          <AnimatePresence>
            {recommended && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-primary/20 backdrop-blur-sm text-primary text-xs font-medium px-3 py-1 rounded-full border border-primary/30 flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3 h-3" />
                Recommended
              </motion.span>
            )}
            {product.isRequired && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-secondary/20 backdrop-blur-sm text-secondary text-xs font-medium px-3 py-1 rounded-full border border-secondary/30 shadow-sm"
              >
                Required
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Product Image */}
        <motion.div 
          className="w-full h-28 bg-gradient-to-br from-muted to-muted/50 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative z-10"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-contain transition-transform duration-300"
            />
          ) : (
            <motion.span 
              className="text-muted-foreground text-sm font-medium"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {product.code}
            </motion.span>
          )}
        </motion.div>

        {/* Content */}
        <div className="flex items-start justify-between gap-2 mb-2 relative z-10">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <motion.button
            onClick={() => setShowModal(true)}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-primary/10"
          >
            <Info className="w-4 h-4" />
          </motion.button>
        </div>

        <p className="text-sm text-muted-foreground mb-3">{product.description}</p>

        {/* Tooltip / microcopy */}
        <p className="text-xs text-secondary mb-4">{product.tooltip}</p>

        {/* Warning */}
        {warning && (
          <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg mb-4">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {warning}
          </div>
        )}

        {/* Disabled reason */}
        {disabled && disabledReason && (
          <p className="text-xs text-destructive mb-4">{disabledReason}</p>
        )}

        {/* Actions */}
        {showQuantity && !disabled && (
          <div className="flex items-center justify-between relative z-10">
            <AnimatePresence mode="wait">
              {!isInCart ? (
                <motion.div
                  key="add-button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full"
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      onClick={handleAdd}
                      size="sm"
                      className="w-full bg-secondary hover:bg-secondary/90 shadow-md hover:shadow-lg shadow-secondary/20 transition-all duration-200"
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                      </motion.div>
                      Add
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="quantity-controls"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-3 w-full justify-center"
                >
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button 
                      onClick={handleDecrement}
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 border-2 hover:border-secondary hover:bg-secondary/10 transition-all"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </motion.div>
                  <motion.span
                    key={quantity}
                    initial={{ scale: 1.2, color: "hsl(var(--color-secondary))" }}
                    animate={{ scale: 1, color: "hsl(var(--color-foreground))" }}
                    className="font-semibold text-foreground w-8 text-center"
                  >
                    {quantity}
                  </motion.span>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button 
                      onClick={handleIncrement}
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 border-2 hover:border-secondary hover:bg-secondary/10 transition-all disabled:opacity-50"
                      disabled={product.zones > 0 && !canAddZones(product.zones)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Pre-selected indicator */}
        {preSelected && !showQuantity && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm text-secondary font-medium relative z-10 flex items-center gap-2"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ✓
            </motion.span>
            Included in your system
          </motion.div>
        )}
      </motion.div>

      <ProductInfoModal 
        product={product}
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default ProductCard;
