import { useState } from 'react';
import { Modal } from './Modal';

/**
 * Modal for adding custom line items to estimate
 * Used for photo-based additions (cables, labor, hardware, etc.)
 */
export function AddCustomItemModal({ isOpen, onClose, onAdd, currency = 'AUD' }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [qty, setQty] = useState(1);
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Item name is required');
      return;
    }

    const numAmount = parseFloat(amount) || 0;
    const numQty = parseInt(qty, 10) || 1;

    if (numAmount <= 0) {
      alert('Unit price must be greater than 0');
      return;
    }

    onAdd({
      name: name.trim(),
      description: description.trim(),
      qty: numQty,
      amount: numAmount,
      currency,
      isCustom: true,
    });

    // Reset form
    setName('');
    setDescription('');
    setQty(1);
    setAmount('');
    onClose();
  };

  const handleCancel = () => {
    setName('');
    setDescription('');
    setQty(1);
    setAmount('');
    onClose();
  };

  const total = (parseFloat(amount) || 0) * (parseInt(qty, 10) || 1);

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Add Custom Item">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Item Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Item Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Additional cabling"
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1EA6DF] bg-background text-foreground"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., 50 feet CAT6 cable"
            rows={2}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1EA6DF] bg-background text-foreground resize-none"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Quantity
          </label>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            min="1"
            step="1"
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1EA6DF] bg-background text-foreground"
          />
        </div>

        {/* Unit Price */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Unit Price ({currency}) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1EA6DF] bg-background text-foreground"
            required
          />
        </div>

        {/* Total Preview */}
        <div className="rounded-lg bg-muted p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Total:</span>
            <span className="text-lg font-bold text-foreground">
              {currency} {total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-gradient-to-r from-[#1EA6DF] to-[#c95375] text-white rounded-lg font-semibold hover:shadow-lg transition"
          >
            Add Item
          </button>
        </div>
      </form>
    </Modal>
  );
}

