import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { CreateTicket } from './pages/CreateTicket';
import { TicketList } from './pages/TicketList';
import { TicketDetail } from './pages/TicketDetail';
import { PublicTicketDetail } from './pages/PublicTicketDetail';
import { PublicCreateTicket } from './pages/PublicCreateTicket';
import { ThankYou } from './pages/ThankYou';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { ThemeProvider } from './lib/theme';
import { I18nProvider } from './lib/i18n/context';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AppContent() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/public/tickets/new" element={<PublicCreateTicket />} />
      <Route path="/public/tickets/thank-you/:id" element={<ThankYou />} />
      <Route path="/public/tickets/:id" element={<PublicTicketDetail />} />
      
      {/* Protected Routes */}
      <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/tickets" element={<RequireAuth><TicketList /></RequireAuth>} />
      <Route path="/tickets/new" element={<RequireAuth><CreateTicket /></RequireAuth>} />
      <Route path="/tickets/:id" element={<RequireAuth><TicketDetail /></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
    </Routes>
  );
}

function App() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ThemeProvider>
    </I18nProvider>
  );
}

export default App;
