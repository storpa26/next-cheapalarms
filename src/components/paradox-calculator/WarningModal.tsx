"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface WarningModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

const WarningModal = ({ 
  open, 
  onClose, 
  onConfirm, 
  title, 
  description,
  confirmLabel = 'Continue anyway',
  cancelLabel = 'Go back',
}: WarningModalProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="bg-card/95 backdrop-blur-md border-2 border-amber-200/50 shadow-2xl">
        <AlertDialogHeader>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex items-center gap-3"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0]
              }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shadow-lg"
            >
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </motion.div>
            <AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <AlertDialogDescription className="pt-2 text-base">
              {description}
            </AlertDialogDescription>
          </motion.div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="flex gap-2 w-full"
          >
            <AlertDialogCancel onClick={onClose} className="flex-1">
              {cancelLabel}
            </AlertDialogCancel>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              <AlertDialogAction 
                onClick={onConfirm} 
                className="w-full bg-amber-600 hover:bg-amber-700 shadow-lg hover:shadow-xl transition-all"
              >
                {confirmLabel}
              </AlertDialogAction>
            </motion.div>
          </motion.div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default WarningModal;
