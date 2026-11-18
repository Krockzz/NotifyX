import { useOutletContext } from "react-router";
import ApplicationDetailHeader from "../../components/application/ApplicationDetailHeader.jsx";
import { ApplicationStats, OverviewPanel } from "../../components/application/ApplicationDetailPanels.jsx";

export default function ApplicationOverviewRoute() {
  const { appId, application, user } = useOutletContext();

  return (
    <>
      <ApplicationDetailHeader application={application} />
      <ApplicationStats />
      <OverviewPanel appId={appId} application={application} user={user} />
    </>
  );
}
