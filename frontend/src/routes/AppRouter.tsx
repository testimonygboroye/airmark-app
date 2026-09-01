import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AuthLayout } from "@/layouts/AuthLayout";
import { SetupLayout } from "@/layouts/SetupLayout";
import { LiveLayout } from "@/layouts/LiveLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { RouteTracker } from "@/components/ui/RouteTracker";

import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { VerifyEmailPage } from "@/pages/auth/VerifyEmailPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { TwoFactorRecoveryPage } from "@/pages/auth/TwoFactorRecoveryPage";
import { DashboardPage } from "@/pages/setup/DashboardPage";
import { CreateTeamPage } from "@/pages/setup/CreateTeamPage";
import { EventsListPage } from "@/pages/setup/EventsListPage";
import { CreateEventPage } from "@/pages/setup/CreateEventPage";
import { EditEventPage } from "@/pages/setup/EditEventPage";
import { EventDetailPage } from "@/pages/setup/EventDetailPage";
import { RunOfShowEditorPage } from "@/pages/setup/RunOfShowEditorPage";
import { HighlightsPage } from "@/pages/setup/HighlightsPage";
import { EquipmentStatusPage } from "@/pages/setup/EquipmentStatusPage";
import { EventChecklistPage } from "@/pages/setup/EventChecklistPage";
import { EventReadinessPage } from "@/pages/setup/EventReadinessPage";
import { ChecklistTemplateEditorPage } from "@/pages/setup/ChecklistTemplateEditorPage";
import { SchedulePage } from "@/pages/setup/SchedulePage";
import { RolesManagementPage } from "@/pages/setup/RolesManagementPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { EditorWorkspacePage } from "@/pages/setup/EditorWorkspacePage";
import { TeamMembersPage } from "@/pages/setup/TeamMembersPage";
import { NotificationsPage } from "@/pages/setup/NotificationsPage";
import { NotificationDetailPage } from "@/pages/setup/NotificationDetailPage";
import { ProfilePage } from "@/pages/setup/ProfilePage";
import { MyInvitesPage } from "@/pages/setup/MyInvitesPage";
import { HelpPage } from "@/pages/setup/HelpPage";
import { HelpArticlePage } from "@/pages/setup/HelpArticlePage";
import { EventLivePage } from "@/pages/live/EventLivePage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <RouteTracker />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/2fa-recovery" element={<TwoFactorRecoveryPage />} />
        </Route>

        <Route
          element={
            <ProtectedRoute>
              <SetupLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/teams/new" element={<CreateTeamPage />} />
          <Route path="/teams/:teamId/events" element={<EventsListPage />} />
          <Route path="/teams/:teamId/events/new" element={<CreateEventPage />} />
          <Route path="/teams/:teamId/checklist-templates" element={<ChecklistTemplateEditorPage />} />
          <Route path="/teams/:teamId/schedule" element={<SchedulePage />} />
          <Route path="/teams/:teamId/roles" element={<RolesManagementPage />} />
          <Route path="/teams/:teamId/editor" element={<EditorWorkspacePage />} />
          <Route path="/teams/:teamId/members" element={<TeamMembersPage />} />
          <Route path="/events/:eventId" element={<EventDetailPage />} />
          <Route path="/events/:eventId/edit" element={<EditEventPage />} />
          <Route path="/events/:eventId/run-of-show" element={<RunOfShowEditorPage />} />
          <Route path="/events/:eventId/highlights" element={<HighlightsPage />} />
          <Route path="/events/:eventId/equipment" element={<EquipmentStatusPage />} />
          <Route path="/events/:eventId/checklist" element={<EventChecklistPage />} />
          <Route path="/events/:eventId/readiness" element={<EventReadinessPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/notifications/:notificationId" element={<NotificationDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/invites" element={<MyInvitesPage />} />
          <Route path="/system-console" element={<AdminDashboardPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/help/:articleId" element={<HelpArticlePage />} />
        </Route>

        <Route
          element={
            <ProtectedRoute>
              <LiveLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/events/:eventId/live" element={<EventLivePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
