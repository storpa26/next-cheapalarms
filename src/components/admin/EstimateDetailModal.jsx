import { Modal } from "./Modal";
import { EstimateDetailContent } from "./EstimateDetailContent";

export function EstimateDetailModal({ isOpen, onClose, estimateId, locationId, onInvoiceCreated }) {
  if (!estimateId) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Estimate #${estimateId}`}
    >
      <EstimateDetailContent
        estimateId={estimateId}
        locationId={locationId}
        onInvoiceCreated={onInvoiceCreated}
      />
    </Modal>
  );
}

