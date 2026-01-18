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
        {view?.workflow?.status === 'accepted' && view?.invoice && view?.payment?.status !== 'paid' ? (
          // Show payment form when accepted and invoice exists (not yet paid)
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
        ) : view?.workflow?.status === 'booked' && view?.payment?.status === 'partial' ? (
          // Show payment form for partial payments (booked but not fully paid)
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

