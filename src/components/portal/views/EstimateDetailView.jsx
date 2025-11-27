import { useState } from "react";
import { EstimateHeader } from "../sections/EstimateHeader";
import { PhotoMissionCard } from "../sections/PhotoMissionCard";
import { ApprovalCard } from "../sections/ApprovalCard";
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
  const [showPhotoUploader, setShowPhotoUploader] = useState(false);

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

      <div className="grid gap-6 lg:grid-cols-2">
        <PhotoMissionCard
          photoItems={photoItems}
          estimateId={estimateId}
          locationId={view?.locationId}
          showUploader={showPhotoUploader}
          onLaunchCamera={() => {
            setShowPhotoUploader(true);
            if (onNavigateToPhotos) onNavigateToPhotos();
          }}
        />
        <ApprovalCard
          view={view}
          estimateId={estimateId}
          locationId={view?.locationId}
          onUploadPhotos={() => {
            setShowPhotoUploader(true);
            if (onNavigateToPhotos) onNavigateToPhotos();
          }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <MissionSteps steps={missionSteps} />
        <ActivityFeed entries={activityFeed} />
      </div>
    </>
  );
}

