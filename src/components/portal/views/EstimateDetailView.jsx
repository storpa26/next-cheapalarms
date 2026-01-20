import { useState, useEffect } from "react";
import { EstimateHeader } from "../sections/EstimateHeader";
import { PhotoMissionCard } from "../sections/PhotoMissionCard";
import { ApprovalCard } from "../sections/ApprovalCard";
import { WorkflowProgress } from "../sections/WorkflowProgress";
import { BookingCard } from "../sections/BookingCard";
import { PaymentCard } from "../sections/PaymentCard";
import { MissionSteps } from "../sections/MissionSteps";
import { ActivityFeed } from "../sections/ActivityFeed";

export function EstimateDetailView({
  estimate,
  progress,
  view,
  photoItems,
  missionSteps,
  activityFeed,
  estimates,
  estimateId,
  estimateData,
  onBackToList,
  onSelectEstimate,
  onNavigateToPhotos,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

   
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <EstimateHeader
        estimate={estimate}
        progress={progress}
        estimates={estimates}
        total={estimate.total}
        hasPhotos={estimate.hasPhotos}
        onBackToList={onBackToList}
        onSelectEstimate={onSelectEstimate}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      {/* Workflow Progress */}
      {view?.workflow && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <WorkflowProgress workflow={view.workflow} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <PhotoMissionCard
          photoItems={photoItems}
          estimateId={estimateId}
          locationId={view?.locationId}
          view={view}
          onLaunchCamera={() => {}}
        />
        
        {/* NEW WORKFLOW ORDER: Payment → Booking
            Show PaymentCard when accepted + invoice exists (payment before booking)
            Show BookingCard when payment is made (partial or full)
            Show ApprovalCard otherwise (not yet accepted)
        */}
        <div suppressHydrationWarning>
          {mounted ? (
            <>
        {/* Show payment form when:
            1. Workflow is in payment-eligible state (accepted or booked)
            2. Invoice exists
            3. Payment is NOT fully paid
            4. There's a remaining balance OR no payment made yet
        */}
        {(() => {
          // Check if workflow is in payment-eligible state
          // Note: 'booked' can occur from booking action OR from partial payment
          // 'paid' workflow status only occurs when FULLY paid, so we don't check for it
          const workflowStatus = view?.workflow?.status;
          const isPaymentEligible = 
            workflowStatus === 'accepted' || 
            workflowStatus === 'booked';
          
          // Check if invoice exists
          const hasInvoice = view?.invoice && (view?.invoice.id || view?.invoice.number);
          
          // Check if payment is NOT fully paid
          // If payment object doesn't exist, it's not fully paid
          // Payment.status is the source of truth - if it's not 'paid', then it's not fully paid
          const isNotFullyPaid = !view?.payment || view?.payment?.status !== 'paid';
          
          // Check if there's a remaining balance
          // Use minimumPaymentInfo.remainingBalance as source of truth (from backend)
          // Fallback to payment.remainingBalance if minimumPaymentInfo not available
          const remainingBalance = view?.minimumPaymentInfo?.remainingBalance ?? view?.payment?.remainingBalance;
          const hasRemainingBalance = 
            !view?.payment || // No payment object = full balance remaining
            (remainingBalance !== null && remainingBalance !== undefined && remainingBalance > 0) ||
            view?.payment?.status === 'partial'; // Partial payment always has remaining balance
          
          return isPaymentEligible && hasInvoice && isNotFullyPaid && hasRemainingBalance;
        })() ? (
          // Show payment form when all conditions are met
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <PaymentCard
              minimumPaymentInfo={view?.minimumPaymentInfo}
              estimateId={estimateId}
              locationId={view?.locationId}
              inviteToken={view?.account?.inviteToken}
              payment={view?.payment}
              workflow={view?.workflow}
              invoice={view?.invoice}
            />
          </div>
        ) : view?.workflow?.status === 'accepted' && view?.payment?.status === 'paid' && !view?.booking ? (
          // Show booking card when payment is made (full payment) and not yet booked
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <BookingCard
              estimateId={estimateId}
              locationId={view?.locationId}
              inviteToken={view?.account?.inviteToken}
              booking={view?.booking}
              workflow={view?.workflow}
            />
          </div>
        ) : (
          // Show approval card for all other states (not yet accepted)
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <ApprovalCard
              view={view}
              estimateId={estimateId}
              locationId={view?.locationId}
                    onUploadPhotos={onNavigateToPhotos}
                  />
                </div>
              )}
            </>
          ) : (
            // Placeholder during SSR - show ApprovalCard as default to match structure
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <ApprovalCard
                view={view}
                estimateId={estimateId}
                locationId={view?.locationId}
                onUploadPhotos={onNavigateToPhotos}
            />
          </div>
        )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <MissionSteps steps={missionSteps} />
        <ActivityFeed entries={activityFeed} />
      </div>
    </>
  );
}

