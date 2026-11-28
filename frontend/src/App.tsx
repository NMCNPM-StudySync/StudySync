import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { CalendarPage } from './pages/calendar/CalendarPage';
import { GroupsPage } from './pages/groups/GroupsPage';
import { KanbanPage } from './pages/kanban/KanbanPage';
import { MeetingsPage } from './pages/meetings/MeetingsPage';
import { NotFoundPage } from './pages/not-found/NotFoundPage';
import { SchedulerPage } from './pages/scheduler/SchedulerPage';
import { StatsPage } from './pages/stats/StatsPage';

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/calendar" replace />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/scheduler" element={<SchedulerPage />} />
            <Route path="/meetings" element={<MeetingsPage />} />
            <Route path="/groups/:id/meetings" element={<MeetingsPage />} />
            <Route path="/kanban" element={<KanbanPage />} />
            <Route path="/groups/:groupId/kanban" element={<KanbanPage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Route>
        </Route>
        <Route element={<Layout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
