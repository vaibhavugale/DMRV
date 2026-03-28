import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { ProjectProvider } from './context/ProjectContext';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Farmers from './pages/Farmers';
import FarmerDetail from './pages/FarmerDetail';
import PlotDetail from './pages/PlotDetail';
import TreeDetail from './pages/TreeDetail';
import Trees from './pages/Trees';
import Saplings from './pages/Saplings';
import Activities from './pages/Activities';
import Reports from './pages/Reports';
import AuditPortal from './pages/AuditPortal';
import LcaAnalysis from './pages/LcaAnalysis';
import BaselineSetup from './pages/BaselineSetup';
import Login from './pages/Login';
import ProjectLaunchpad from './pages/ProjectLaunchpad';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Super Admin Only: Launchpad */}
            <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
              <Route element={<Layout />}>
                <Route path="/launchpad" element={<ProjectLaunchpad />} />
              </Route>
            </Route>

            {/* General Administrative Routes: Super Admin & Admin */}
            <Route element={<ProtectedRoute allowedRoles={['super_admin', 'admin']} />}>
              <Route element={<Layout />}>
                  <Route path="/lca" element={<LcaAnalysis />} />
                  <Route path="/baseline" element={<BaselineSetup />} />
              </Route>
            </Route>

            {/* Data Management: Super Admin, Admin, & Operator */}
            <Route element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'operator', 'auditor']} />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/farmers" element={<Farmers />} />
                <Route path="/farmers/:id" element={<FarmerDetail />} />
                <Route path="/plots/:id" element={<PlotDetail />} />
                <Route path="/trees/:id" element={<TreeDetail />} />
                <Route path="/trees" element={<Trees />} />
                <Route path="/saplings" element={<Saplings />} />
                <Route path="/activities" element={<Activities />} />
              </Route>
            </Route>

            {/* Reporting & Audit: Super Admin, Admin, & Auditor */}
            <Route element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'auditor']} />}>
              <Route element={<Layout />}>
                <Route path="/reports" element={<Reports />} />
                <Route path="/audit" element={<AuditPortal />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;
