import { Routes, Route } from "react-router-dom";
import LoginPage from "./features/auth/LoginPage";
import DashboardPage from "./features/dashboard/DashboardPage";
import HistoryPage from './features/history/HistoryPage'
import TeamPage from './features/team/TeamPage'
import ManagePage from "./features/manage/ManagePage";
import ProtectedRoute from "./routes/ProtectedRoute";
import SidebarLayout from "./components/layout/SidebarLayout";
import NotFoundPage from "./features/not-found/NotFoundPage";
import ApprovalsPage from "./features/approvals/ApprovalPages";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<SidebarLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/approvals" element={<ApprovalsPage />} />
          <Route path="/manage" element={<ManagePage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
