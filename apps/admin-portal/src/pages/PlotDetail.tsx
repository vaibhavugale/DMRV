import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../api';
import EditPlotModal from '../components/EditPlotModal';
import CreateTreeModal from '../components/CreateTreeModal';

interface TreeInPlot {
  treeId: string;
  speciesScientific: string;
  speciesCommon?: string;
  dbhCm: number;
  heightM: number;
  conditionStatus: string;
}

interface PlotDetailData {
  plotId: string;
  name: string;
  farmerId: string;
  areaHectares: number;
  currentLandUse: string;
  verificationStatus: string;
  plantingDensity?: number;
  soilType?: string;
  elevation?: number;
  landUseHistory: { year: number; landUse: string; description?: string }[];
}

export default function PlotDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plot, setPlot] = useState<PlotDetailData | null>(null);
  const [trees, setTrees] = useState<TreeInPlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditPlotModal, setShowEditPlotModal] = useState(false);
  const [showAddTreeModal, setShowAddTreeModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plotRes, treesRes] = await Promise.all([
        apiFetch<{ data: PlotDetailData }>(`/plots/${id}`),
        apiFetch<{ data: TreeInPlot[] }>(`/trees?plotId=${id}`)
      ]);
      setPlot(plotRes.data);
      setTrees(treesRes.data);
    } catch (err) {
      console.error('Failed to fetch plot details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) return <div className="p-8">Loading plot details...</div>;
  if (!plot) return <div className="p-8">Plot not found.</div>;

  const condBadge = (s: string) => {
    const m: Record<string, string> = { healthy: 'green', stressed: 'amber', dead: 'red', replanted: 'blue', diseased: 'red' };
    return <span className={`badge ${m[s] || 'gray'}`}>{s}</span>;
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/farmers')}>← Back</button>
            <h1>{plot.name}</h1>
            <span className={`badge ${plot.verificationStatus === 'verified' ? 'green' : 'amber'}`}>{plot.verificationStatus}</span>
          </div>
          <p>Plot ID: {plot.plotId} — Farmer: {plot.farmerId}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowEditPlotModal(true)}>Edit Plot</button>
      </div>

      {showEditPlotModal && (
        <EditPlotModal 
          plot={plot as any}
          onClose={() => setShowEditPlotModal(false)}
          onSuccess={fetchData}
        />
      )}

      <div className="detail-grid">
        <div className="detail-item"><label>Area</label><span>{plot.areaHectares} hectares</span></div>
        <div className="detail-item"><label>Land Use</label><span>{plot.currentLandUse}</span></div>
        <div className="detail-item"><label>Planting Density</label><span>{plot.plantingDensity || '—'} trees/ha</span></div>
        <div className="detail-item"><label>Soil Type</label><span>{plot.soilType || '—'}</span></div>
        <div className="detail-item"><label>Elevation</label><span>{plot.elevation || '—'}m</span></div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Land Use History</div>
          </div>
          <div className="timeline">
            {plot.landUseHistory?.length > 0 ? plot.landUseHistory.map((h, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-item-header">
                  <span className="timeline-item-title">{h.year} — {h.landUse}</span>
                </div>
                <div className="timeline-item-desc">{h.description}</div>
              </div>
            )) : <div className="p-4 text-muted">No history recorded.</div>}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Trees in Plot</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge green">{trees.length} trees</span>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddTreeModal(true)}>+ Add Tree</button>
            </div>
          </div>

          {showAddTreeModal && (
            <CreateTreeModal 
              plotId={plot.plotId}
              onClose={() => setShowAddTreeModal(false)}
              onSuccess={fetchData}
            />
          )}
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Species</th><th>DBH</th><th>Height</th><th>Condition</th></tr>
              </thead>
              <tbody>
                {trees.map(tree => (
                  <tr key={tree.treeId}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>
                      <Link to={`/trees/${tree.treeId}`} style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>{tree.treeId}</Link>
                    </td>
                    <td style={{ fontStyle: 'italic' }}>{tree.speciesScientific}</td>
                    <td>{tree.dbhCm} cm</td>
                    <td>{tree.heightM} m</td>
                    <td>{condBadge(tree.conditionStatus)}</td>
                  </tr>
                ))}
                {trees.length === 0 && (
                  <tr><td colSpan={5} className="text-center p-8 text-muted">No trees registered in this plot.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
