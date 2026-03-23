import { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import { useProject } from '../context/ProjectContext';

export default function BaselineSetup() {
  const { activeProjectId } = useProject();
  const [projectData, setProjectData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeProjectId) return;
    
    async function loadProject() {
      try {
        setLoading(true);
        // Load the full project settings
        const res = await apiFetch<any>(`/projects/${activeProjectId}`);
        setProjectData(res.data);
      } catch (err) {
        console.error('Failed to load project details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [activeProjectId]);

  if (loading) return <div className="p-6">Loading Baseline Configuration...</div>;
  if (!projectData) return <div className="p-6">No project selected.</div>;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Baseline Configuration</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage historical reference periods, control areas, and methodology parameters.</p>
        </div>
        <button className="btn-primary">Edit Configuration</button>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', marginBottom: 32 }}>
        {/* General Settings */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Methodology Settings</div>
            </div>
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>Applied Methodology</div>
              <div style={{ fontSize: 16, color: 'var(--text-primary)', marginTop: 4 }}>{projectData.methodology || 'VM0047 ARR'}</div>
            </div>
            
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>Project Start Date</div>
                <div style={{ fontSize: 16, color: 'var(--text-primary)', marginTop: 4 }}>
                  {new Date(projectData.startDate).toLocaleDateString()}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>Status</div>
                <div style={{ marginTop: 4 }}>
                  <span className="badge green">
                    {projectData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>Reference Period Start</div>
                <div style={{ fontSize: 16, color: 'var(--text-primary)', marginTop: 4 }}>
                  {new Date(projectData.baseline?.referencePeriodStart).toLocaleDateString()}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>Reference Period End</div>
                <div style={{ fontSize: 16, color: 'var(--text-primary)', marginTop: 4 }}>
                  {new Date(projectData.baseline?.referencePeriodEnd).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LCA Parameters */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Emission Factors (LCA)</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px dashed var(--border-subtle)' }}>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Baseline Emissions Factor</span>
              <span style={{ fontFamily: 'monospace', fontSize: 14 }}>{projectData.baseline?.baselineEmissionsFactorCO2ePerHa} tCO₂e/ha</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px dashed var(--border-subtle)' }}>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Transport Factor</span>
              <span style={{ fontFamily: 'monospace', fontSize: 14 }}>{projectData.lcaSettings?.transportEmissionsFactorCO2ePerKm} kgCO₂e/km</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px dashed var(--border-subtle)' }}>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Fertilizer Factor</span>
              <span style={{ fontFamily: 'monospace', fontSize: 14 }}>{projectData.lcaSettings?.fertilizerEmissionsFactorCO2ePerKg} kgCO₂e/kg</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Default Wood Density</span>
              <span style={{ fontFamily: 'monospace', fontSize: 14 }}>{projectData.lcaSettings?.defaultWoodDensity} g/cm³</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card full-width" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--border-subtle)', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Control Area Geometry</h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>GeoJSON MultiPolygon</span>
        </div>
        <div style={{ background: '#1e293b', color: '#4ade80', fontFamily: 'monospace', fontSize: 14, height: 256, overflowY: 'auto' }}>
          <pre style={{ padding: 16 }}>
            {JSON.stringify(projectData.baseline?.controlArea, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
