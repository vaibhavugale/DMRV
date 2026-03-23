import { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import CreateActivityModal from '../components/CreateActivityModal';

interface ActivityRecord {
  activityId: string;
  farmerId: string;
  plotId: string;
  treeId?: string;
  type: string;
  description: string;
  timestamp: string;
  performedBy: string;
}

const MOCK_ACTIVITIES: ActivityRecord[] = [
  { activityId: 'ACT-00000005', farmerId: 'FRM-00000003', plotId: 'PLT-00000004', treeId: 'TRE-00000010', type: 'replanting', description: 'Replaced dead Terminalia arjuna with new sapling', timestamp: '2024-12-01T10:00:00Z', performedBy: 'USR-ENUM-001' },
  { activityId: 'ACT-00000008', farmerId: 'FRM-00000002', plotId: 'PLT-00000003', type: 'pruning', description: 'Pruning mature coconut palms', timestamp: '2024-12-20T09:30:00Z', performedBy: 'USR-ENUM-001' },
  { activityId: 'ACT-00000007', farmerId: 'FRM-00000001', plotId: 'PLT-00000002', type: 'irrigation', description: 'Drip irrigation system maintenance', timestamp: '2024-11-10T14:00:00Z', performedBy: 'USR-ENUM-001' },
  { activityId: 'ACT-00000004', farmerId: 'FRM-00000003', plotId: 'PLT-00000004', type: 'monitoring', description: 'Quarterly monitoring visit - measured DBH and height', timestamp: '2024-10-05T08:00:00Z', performedBy: 'USR-ENUM-001' },
  { activityId: 'ACT-00000002', farmerId: 'FRM-00000001', plotId: 'PLT-00000001', type: 'maintenance', description: 'Weeding and mulching around established trees', timestamp: '2024-09-20T11:00:00Z', performedBy: 'USR-ENUM-001' },
  { activityId: 'ACT-00000006', farmerId: 'FRM-00000005', plotId: 'PLT-00000005', type: 'pest_control', description: 'Organic pest management for coffee plants', timestamp: '2024-08-15T07:00:00Z', performedBy: 'USR-ENUM-001' },
  { activityId: 'ACT-00000003', farmerId: 'FRM-00000002', plotId: 'PLT-00000003', type: 'planting', description: 'Planted 30 mixed species including Coconut and Guava', timestamp: '2024-07-10T06:30:00Z', performedBy: 'USR-ENUM-001' },
  { activityId: 'ACT-00000001', farmerId: 'FRM-00000001', plotId: 'PLT-00000001', type: 'planting', description: 'Planted 50 Tectona grandis saplings in North Plot', timestamp: '2024-06-15T08:00:00Z', performedBy: 'USR-ENUM-001' },
];

export default function Activities() {
  const [activities, setActivities] = useState<ActivityRecord[]>(MOCK_ACTIVITIES);
  const [typeFilter, setTypeFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchActivities = () => {
    apiFetch<{ data: ActivityRecord[] }>('/activities')
      .then(res => setActivities(res.data))
      .catch(() => setActivities(MOCK_ACTIVITIES));
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const types = [...new Set(activities.map(a => a.type))].sort();
  const filtered = activities.filter(a => !typeFilter || a.type === typeFilter);

  const typeIcons: Record<string, string> = {
    planting: '🌱', maintenance: '🔧', monitoring: '📊', pest_control: '🐛',
    pruning: '✂️', irrigation: '💧', replanting: '🔄', harvesting: '🌾',
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Activity Monitor</h1>
          <p>Timestamped logs of all field operations — audit-ready records for VVB reviews</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>+ Log Activity</button>
      </div>

      {showCreateModal && (
        <CreateActivityModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchActivities}
        />
      )}

      <div className="filters-bar">
        <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Activity Types</option>
          {types.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="timeline">
          {filtered.map(act => (
            <div className="timeline-item" key={act.activityId}>
              <div className="timeline-item-header">
                <span className="timeline-item-title">
                  {typeIcons[act.type] || '📋'} {act.type.replace('_', ' ')}
                </span>
                <span className="badge blue">{act.plotId}</span>
                <span className="badge gray">{act.farmerId}</span>
                <span className="timeline-item-time">
                  {new Date(act.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="timeline-item-desc">{act.description}</div>
              {act.treeId && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Related tree: {act.treeId}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
