import { useState } from "react";
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
        
        {/* Show ApprovalCard only if not accepted, or show BookingCard/PaymentCard based on workflow */}
        {view?.workflow?.status === 'accepted' && !view?.booking ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <BookingCard
              estimateId={estimateId}
              locationId={view?.locationId}
              inviteToken={view?.account?.inviteToken}
              booking={view?.booking}
              workflow={view?.workflow}
            />
          </div>
        ) : view?.workflow?.status === 'booked' && view?.payment?.status !== 'paid' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <PaymentCard
              estimateId={estimateId}
              locationId={view?.locationId}
              inviteToken={view?.account?.inviteToken}
              payment={view?.payment}
              workflow={view?.workflow}
              invoice={view?.invoice}
            />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <ApprovalCard
              view={view}
              estimateId={estimateId}
              locationId={view?.locationId}
              onUploadPhotos={() => {}}
            />
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <MissionSteps steps={missionSteps} />
        <ActivityFeed entries={activityFeed} />
      </div>
    </>
  );
}

