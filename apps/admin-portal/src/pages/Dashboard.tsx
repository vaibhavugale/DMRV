import { useState, useEffect } from 'react';
import { apiFetch } from '../api';

interface DashboardStats {
  kpis: {
    totalFarmers: number;
    totalPlots: number;
    totalTrees: number;
    totalActivities: number;
    totalAreaHectares: number;
    totalCarbonTonnes: number;
    healthyTrees: number;
    mortalityRate: number;
  };
  treesByCondition: { _id: string; count: number }[];
  treesBySpecies: { _id: string; count: number }[];
  recentActivities: { activityId: string; type: string; description: string; timestamp: string; performedBy: string }[];
}

const MOCK_STATS: DashboardStats = {
  kpis: { totalFarmers: 5, totalPlots: 5, totalTrees: 20, totalActivities: 8, totalAreaHectares: 16.5, totalCarbonTonnes: 2.85, healthyTrees: 17, mortalityRate: 5 },
  treesByCondition: [{ _id: 'healthy', count: 17 }, { _id: 'stressed', count: 1 }, { _id: 'dead', count: 1 }, { _id: 'replanted', count: 1 }],
  treesBySpecies: [
    { _id: 'Tectona grandis', count: 2 }, { _id: 'Azadirachta indica', count: 2 },
    { _id: 'Mangifera indica', count: 2 }, { _id: 'Leucaena leucocephala', count: 2 },
    { _id: 'Acacia mangium', count: 2 }, { _id: 'Coffea arabica', count: 1 },
    { _id: 'Ficus religiosa', count: 1 }, { _id: 'Cocos nucifera', count: 1 },
  ],
  recentActivities: [
    { activityId: 'ACT-001', type: 'replanting', description: 'Replaced dead Terminalia arjuna', timestamp: '2024-12-01', performedBy: 'Field Runner' },
    { activityId: 'ACT-002', type: 'pruning', description: 'Pruning mature coconut palms', timestamp: '2024-12-20', performedBy: 'Field Runner' },
    { activityId: 'ACT-003', type: 'irrigation', description: 'Drip irrigation system maintenance', timestamp: '2024-11-10', performedBy: 'Field Runner' },
    { activityId: 'ACT-004', type: 'monitoring', description: 'Quarterly monitoring — DBH & height', timestamp: '2024-10-05', performedBy: 'Field Runner' },
    { activityId: 'ACT-005', type: 'maintenance', description: 'Weeding and mulching', timestamp: '2024-09-20', performedBy: 'Field Runner' },
  ],
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>(MOCK_STATS);
  useEffect(() => {
    apiFetch<{ data: DashboardStats }>('/reports/dashboard-stats')
      .then(res => setStats(res.data))
      .catch(() => setStats(MOCK_STATS));
  }, []);

  const k = stats.kpis;

  return (
    <div className="fade-in">
      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card green">
          <div className="stat-icon green">🌳</div>
          <div className="stat-info">
            <div className="stat-label">Total Trees</div>
            <div className="stat-value">{k.totalTrees.toLocaleString()}</div>
            <div className="stat-change positive">↑ {k.healthyTrees} healthy</div>
          </div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber">🌍</div>
          <div className="stat-info">
            <div className="stat-label">Carbon Sequestered</div>
            <div className="stat-value">{k.totalCarbonTonnes.toFixed(2)}</div>
            <div className="stat-change positive">tCO₂e estimated</div>
          </div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon blue">👨‍🌾</div>
          <div className="stat-info">
            <div className="stat-label">Registered Farmers</div>
            <div className="stat-value">{k.totalFarmers}</div>
            <div className="stat-change positive">across 3 countries</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green">🗺️</div>
          <div className="stat-info">
            <div className="stat-label">Total Area</div>
            <div className="stat-value">{k.totalAreaHectares.toFixed(1)}</div>
            <div className="stat-change positive">hectares monitored</div>
          </div>
        </div>
      </div>

      {/* Second row: more KPIs */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon blue">📐</div>
          <div className="stat-info">
            <div className="stat-label">Farm Plots</div>
            <div className="stat-value">{k.totalPlots}</div>
            <div className="stat-change positive">GeoJSON polygons</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green">📋</div>
          <div className="stat-info">
            <div className="stat-label">Field Activities</div>
            <div className="stat-value">{k.totalActivities}</div>
            <div className="stat-change positive">audit-ready records</div>
          </div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon red">💀</div>
          <div className="stat-info">
            <div className="stat-label">Mortality Rate</div>
            <div className="stat-value">{k.mortalityRate}%</div>
            <div className="stat-change negative">buffer pool impact</div>
          </div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber">📜</div>
          <div className="stat-info">
            <div className="stat-label">Methodology</div>
            <div className="stat-value" style={{ fontSize: 16 }}>VM0047</div>
            <div className="stat-change positive">Verra ARR</div>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Species Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Species Distribution</div>
              <div className="card-subtitle">Top species by tree count</div>
            </div>
          </div>
          <div>
            {stats.treesBySpecies.map((sp, i) => (
              <div key={sp._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < stats.treesBySpecies.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>🌿</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', fontStyle: 'italic' }}>{sp._id}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="carbon-bar" style={{ width: 80 }}>
                    <div className="carbon-bar-fill" style={{ width: `${(sp.count / 3) * 100}%` }}></div>
                  </div>
                  <span className="badge green">{sp.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tree Health */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Tree Health Overview</div>
              <div className="card-subtitle">Condition status across all plots</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {stats.treesByCondition.map(cond => {
              const pct = k.totalTrees > 0 ? ((cond.count / k.totalTrees) * 100).toFixed(1) : '0';
              const icons: Record<string, string> = { healthy: '✅', stressed: '⚠️', dead: '💀', replanted: '🔄' };
              return (
                <div key={cond._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {icons[cond._id] || '🌳'} {cond._id}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {cond.count} ({pct}%)
                    </span>
                  </div>
                  <div className="carbon-bar">
                    <div className="carbon-bar-fill" style={{
                      width: `${pct}%`,
                      background: cond._id === 'healthy' ? 'var(--color-primary-500)' :
                        cond._id === 'stressed' ? 'var(--color-accent-500)' :
                        cond._id === 'dead' ? 'var(--color-danger-500)' : 'var(--color-info-500)'
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card full-width">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Field Activities</div>
              <div className="card-subtitle">Latest operations logged by field teams</div>
            </div>
          </div>
          <div className="timeline">
            {stats.recentActivities.map(act => {
              const typeIcons: Record<string, string> = {
                planting: '🌱', maintenance: '🔧', monitoring: '📊', pest_control: '🐛',
                pruning: '✂️', irrigation: '💧', replanting: '🔄', harvesting: '🌾',
              };
              return (
                <div className="timeline-item" key={act.activityId}>
                  <div className="timeline-item-header">
                    <span className="timeline-item-title">
                      {typeIcons[act.type] || '📋'} {act.type.replace('_', ' ')}
                    </span>
                    <span className="badge gray">{act.performedBy}</span>
                    <span className="timeline-item-time">
                      {new Date(act.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="timeline-item-desc">{act.description}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
