import DashboardShell from "../components/dashboard/DashboardShell.jsx";

export function meta() {
  return [
    { title: "Dashboard · NotifyX" },
    { name: "description", content: "Manage your NotifyX notification applications and event delivery workspace." },
  ];
}

export default function Dashboard() {
  return <DashboardShell />;
}
