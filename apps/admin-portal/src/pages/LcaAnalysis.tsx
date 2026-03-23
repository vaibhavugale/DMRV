import { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import { useProject } from '../context/ProjectContext';

export default function LcaAnalysis() {
  const { activeProjectId } = useProject();
  const [lcaData, setLcaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeProjectId) return;
    
    async function loadLca() {
      try {
        setLoading(true);
        // We use the direct endpoint which already gets ?projectId appended by apiFetch
        const res = await apiFetch<any>(`/projects/${activeProjectId}/lca`);
        setLcaData(res.data);
      } catch (err) {
        console.error('Failed to load LCA:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLca();
  }, [activeProjectId]);

  if (loading) return <div className="p-6">Calculating carbon impact...</div>;
  if (!lcaData) return <div className="p-6">No LCA data available.</div>;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Life Cycle Assessment (LCA)</h2>
        <p style={{ color: 'var(--text-muted)' }}>Net carbon impact calculation for the active project based on real-time inventory and operational activities.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card green">
          <div className="stat-info">
            <div className="stat-label">Gross Sequestered (Gains)</div>
            <div className="stat-value">{lcaData.grossGains.toFixed(2)} <span style={{ fontSize: 16, fontWeight: 400 }}>tCO₂e</span></div>
          </div>
        </div>

        <div className="stat-card blue">
          <div className="stat-info">
            <div className="stat-label">Baseline Emissions</div>
            <div className="stat-value text-gray-500">{lcaData.baselineEmissions.toFixed(2)} <span style={{ fontSize: 16, fontWeight: 400 }}>tCO₂e</span></div>
          </div>
        </div>

        <div className="stat-card red">
          <div className="stat-info">
            <div className="stat-label">Project Emissions (Losses)</div>
            <div className="stat-value">{lcaData.totalLosses.toFixed(2)} <span style={{ fontSize: 16, fontWeight: 400 }}>tCO₂e</span></div>
          </div>
        </div>

        <div className="stat-card amber">
          <div className="stat-info">
            <div className="stat-label" style={{ color: 'var(--color-primary-700)' }}>Net Carbon Impact</div>
            <div className="stat-value" style={{ color: 'var(--color-primary-600)' }}>
              {lcaData.netImpact.toFixed(2)} <span style={{ fontSize: 16, fontWeight: 400 }}>tCO₂e</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card full-width">
        <div className="card-header">
          <div>
            <div className="card-title">Calculation Methodology</div>
          </div>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>1. Baseline</div>
                <div style={{ color: 'var(--text-secondary)' }}>Estimated emissions that would have occurred in the absence of the project.</div>
              </div>
              <div style={{ fontFamily: 'monospace', background: '#e2e8f0', padding: '4px 12px', borderRadius: 4, color: '#334155' }}>BE = Area × Factor</div>
            </div>
            
            <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #dcfce7' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#166534' }}>2. Carbon Gains</div>
                <div style={{ color: 'var(--text-secondary)' }}>Total CO₂e stored in living biomass (trees), calculated via species-specific allometric equations.</div>
              </div>
              <div className="badge green">↑ {lcaData.grossGains.toFixed(2)}</div>
            </div>
            
            <div style={{ padding: 16, background: '#fef2f2', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #fee2e2' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#991b1b' }}>3. Project Emissions</div>
                <div style={{ color: 'var(--text-secondary)' }}>Emissions resulting from project implementation (e.g., fertilizer application, transport).</div>
              </div>
              <div className="badge red">↓ {lcaData.totalLosses.toFixed(2)}</div>
            </div>

            <div style={{ paddingTop: 16, marginTop: 16, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>Net Calculation</div>
              <div style={{ fontSize: 20, fontFamily: 'monospace', color: 'var(--color-primary-600)', fontWeight: 700 }}>
                {lcaData.grossGains.toFixed(2)} - {lcaData.baselineEmissions.toFixed(2)} - {lcaData.totalLosses.toFixed(2)} = {lcaData.netImpact.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
