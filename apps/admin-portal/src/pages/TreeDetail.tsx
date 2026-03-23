import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import CreateActivityModal from '../components/CreateActivityModal';

interface TreeRecord {
  treeId: string;
  plotId: string;
  farmerId: string;
  speciesScientific: string;
  speciesCommon: string;
  family: string;
  dbhCm: number;
  heightM: number;
  conditionStatus: string;
  plantingDate: string;
  carbonSequestered?: number;
  ageYears?: number;
}

interface ActivityItem {
  activityId: string;
  type: string;
  description: string;
  timestamp: string;
  performedBy: string;
}

export default function TreeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tree, setTree] = useState<TreeRecord | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogActivityModal, setShowLogActivityModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch tree details
        const treeRes = await apiFetch<{ data: TreeRecord }>(`/trees/${id}`);
        setTree(treeRes.data);

        // Fetch tree activities
        const activityRes = await apiFetch<{ data: ActivityItem[] }>(`/activities?treeId=${id}`);
        setActivities(activityRes.data);
      } catch (err) {
        console.error('Failed to fetch tree details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="page-content">Loading tree details...</div>;
  if (!tree) return <div className="page-content">Tree not found.</div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm">← Back</button>
            <h1>Tree: {tree.treeId}</h1>
          </div>
          <p>Scientific Name: <i>{tree.speciesScientific}</i> — {tree.speciesCommon || 'No common name'}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary" onClick={() => setShowLogActivityModal(true)}>Log Activity</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card green">
          <div className="stat-info">
            <div className="stat-label">Estimated Carbon</div>
            <div className="stat-value">{tree.carbonSequestered?.toFixed(2) || '0.00'} kg</div>
          </div>
        </div>
        <div className="stat-card blue">
          <div className="stat-info">
            <div className="stat-label">Age</div>
            <div className="stat-value">{tree.ageYears || '0'} years</div>
          </div>
        </div>
        <div className="stat-card amber">
          <div className="stat-info">
            <div className="stat-label">Condition</div>
            <div className="stat-value" style={{ fontSize: '18px', textTransform: 'capitalize' }}>{tree.conditionStatus}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Botanical Details</div>
          </div>
          <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="detail-item"><label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Family</label><span style={{ fontWeight: 500 }}>{tree.family}</span></div>
            <div className="detail-item"><label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>DBH</label><span style={{ fontWeight: 500 }}>{tree.dbhCm} cm</span></div>
            <div className="detail-item"><label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Height</label><span style={{ fontWeight: 500 }}>{tree.heightM} m</span></div>
            <div className="detail-item"><label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Planting Date</label><span style={{ fontWeight: 500 }}>{new Date(tree.plantingDate).toLocaleDateString()}</span></div>
            <div className="detail-item"><label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Plot ID</label><span style={{ fontWeight: 500, color: 'var(--color-primary-600)', cursor: 'pointer' }} onClick={() => navigate(`/plots/${tree.plotId}`)}>{tree.plotId}</span></div>
            <div className="detail-item"><label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Farmer ID</label><span style={{ fontWeight: 500, color: 'var(--color-primary-600)', cursor: 'pointer' }} onClick={() => navigate(`/farmers/${tree.farmerId}`)}>{tree.farmerId}</span></div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Activity History</div>
          </div>
          {activities.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No activities recorded for this tree.</div>
          ) : (
            <div className="timeline">
              {activities.map(act => (
                <div key={act.activityId} className="timeline-item">
                  <div className="timeline-item-header">
                    <span className="timeline-item-title" style={{ textTransform: 'capitalize' }}>{act.type}</span>
                    <span className="timeline-item-time">{new Date(act.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="timeline-item-desc">{act.description}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>By: {act.performedBy}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showLogActivityModal && (
        <CreateActivityModal 
          farmerId={tree.farmerId}
          plotId={tree.plotId}
          treeId={tree.treeId}
          onClose={() => setShowLogActivityModal(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
}
