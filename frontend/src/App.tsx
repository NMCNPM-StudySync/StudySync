import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { GroupsPage } from './pages/groups/GroupsPage';
import { CalendarPage } from './pages/calendar/CalendarPage';
import { SchedulerPage } from './pages/scheduler/SchedulerPage';
import { MeetingsPage } from './pages/meetings/MeetingsPage';
import { KanbanPage } from './pages/kanban/KanbanPage';
import { StatsPage } from './pages/stats/StatsPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/calendar" replace />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/scheduler" element={<SchedulerPage />} />
        <Route path="/meetings" element={<MeetingsPage />} />
        <Route path="/kanban" element={<KanbanPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
