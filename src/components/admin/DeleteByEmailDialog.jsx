import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Input } from "../ui/input";
import { AlertCircle, Trash2, Mail } from "lucide-react";
import { useState, useEffect } from "react";

export function DeleteByEmailDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  email: initialEmail = "",
}) {
  const [email, setEmail] = useState(initialEmail);
  const [confirmText, setConfirmText] = useState("");

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setEmail(initialEmail);
      setConfirmText("");
    }
  }, [open, initialEmail]);

  // Basic email validation (RFC 5322 simplified - good enough for admin use)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Case-insensitive confirmation for better UX
  const isValid = email && emailRegex.test(email.trim()) && confirmText.trim().toUpperCase() === "DELETE ALL";

  const handleConfirm = () => {
    if (isValid) {
      onConfirm(email);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-destructive/10 p-2">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle>Complete Deletion by Email</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-4">
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-sm font-medium text-destructive mb-2">
                ⚠️ This action cannot be undone
              </p>
              <p className="text-xs text-muted-foreground">
                This will permanently delete <strong>everything</strong> associated with this email:
              </p>
              <ul className="text-xs text-muted-foreground mt-2 ml-4 list-disc space-y-1">
                <li>Contact from GoHighLevel</li>
                <li>All estimates (GHL + local database)</li>
                <li>All invoices (GHL + local database)</li>
                <li>All metadata and snapshots</li>
                <li>WordPress user account</li>
              </ul>
            </div>

            <div className="space-y-2">
              <label htmlFor="delete-email" className="text-sm font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="delete-email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-text" className="text-sm font-medium">
                Type <strong>DELETE ALL</strong> to confirm
              </label>
              <Input
                id="confirm-text"
                type="text"
                placeholder="DELETE ALL"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                disabled={isLoading}
                className="font-mono"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isValid || isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Deleting..." : "Delete Everything"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
