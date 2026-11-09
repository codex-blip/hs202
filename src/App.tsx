import { Routes, Route } from 'react-router';
import { Toaster } from 'sonner';
import { LanguageProvider } from '@/lib/i18n';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import TopicsPage from './pages/TopicsPage';
import SchemesPage from './pages/SchemesPage';
import GrievancePage from './pages/GrievancePage';
import AboutPage from './pages/AboutPage';

export default function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/topics" element={<TopicsPage />} />
        <Route path="/schemes" element={<SchemesPage />} />
        <Route path="/grievance" element={<GrievancePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
      <Toaster position="bottom-center" richColors />
    </LanguageProvider>
  );
}
