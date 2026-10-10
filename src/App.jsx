import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import FloatingAIChatWidget from './components/FloatingAIChatWidget';

import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import PostProject from './pages/PostProject';
import ClientDashboard from './pages/ClientDashboard';
import FreelancerDashboard from './pages/FreelancerDashboard';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';
import AIAssistant from './pages/AIAssistant';
import Profile from './pages/Profile';

function App() {
  return (
    <div className="d-flex flex-column min-vh-100 position-relative">
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          {/* Public Marketplace & Auth Routes */}
          <Route path="/" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Client Routes */}
          <Route element={<ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']} />}>
            <Route path="/post-project" element={<PostProject />} />
            <Route path="/client-dashboard" element={<ClientDashboard />} />
          </Route>

          {/* Protected Freelancer Routes */}
          <Route element={<ProtectedRoute allowedRoles={['FREELANCER', 'ADMIN']} />}>
            <Route path="/freelancer-dashboard" element={<FreelancerDashboard />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Protected Authenticated Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Floating AI Assistant Widget */}
      <FloatingAIChatWidget />
    </div>
  );
}

export default App;
