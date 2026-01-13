"use client";

import { Product } from '../../types/paradox-calculator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Check, Sparkles, Zap } from 'lucide-react';

interface ProductInfoModalProps {
  product: Product;
  open: boolean;
  onClose: () => void;
}

const ProductInfoModal = ({ product, open, onClose }: ProductInfoModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {product.name}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {/* Image placeholder */}
          <div className="w-full h-40 bg-muted rounded-lg flex items-center justify-center border border-border">
            <span className="text-lg font-medium text-muted-foreground">
              {product.code}
            </span>
          </div>

          {/* Zone badge */}
          {product.zones > 0 && (
            <Badge variant="info" className="gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Uses {product.zones} zone{product.zones > 1 ? 's' : ''} of 32
            </Badge>
          )}

          {/* Description */}
          <div>
            <h4 className="font-semibold text-foreground mb-2">
              About this product
            </h4>
            <p className="text-muted-foreground leading-relaxed text-sm">
              {product.fullDescription}
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Features */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">
              Features
            </h4>
            <ul className="space-y-2">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-secondary to-secondary-hover flex items-center justify-center shadow-sm shadow-secondary/30 flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-muted-foreground text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* When to use */}
          <div className="bg-info-bg border border-info/30 rounded-lg p-4">
            <h4 className="font-semibold text-info mb-2">
              When to use
            </h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {product.whenToUse}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductInfoModal;
