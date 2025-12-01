import { Modal } from "./Modal";
import { InvoiceDetailContent } from "./InvoiceDetailContent";

export function InvoiceDetailModal({ isOpen, onClose, invoiceId, locationId }) {
  if (!invoiceId) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invoice #${invoiceId}`}
    >
      <InvoiceDetailContent
        invoiceId={invoiceId}
        locationId={locationId}
      />
    </Modal>
  );
}

