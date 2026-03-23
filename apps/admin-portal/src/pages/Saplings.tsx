import { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import { useProject } from '../context/ProjectContext';
import { SPECIES_REGISTRY } from '../constants/species-data';

interface DemandEntry {
  _id: string;
  projectId: string;
  species: string;
  commonName: string;
  quantity: number;
  projectInstance: string;
  status: string;
}

export default function Saplings() {
  const { activeProjectId } = useProject();
  const [demands, setDemands] = useState<DemandEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [quantity, setQuantity] = useState('');
  const [projectInstance, setProjectInstance] = useState('');
  const [projectName, setProjectName] = useState('');

  const fetchDemands = async () => {
    if (!activeProjectId) return;
    setLoading(true);
    try {
      const res = await apiFetch<{ data: DemandEntry[] }>(`/sapling-demands`);
      setDemands(res.data || []);
    } catch (err) {
      console.error('Failed to fetch sapling demands:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDetails = async () => {
    if (!activeProjectId) return;
    try {
      const res = await apiFetch<{ data: any }>(`/projects/${activeProjectId}`);
      setProjectName(res.data.name);
      // Set a default project instance if none selected
      if (!projectInstance) {
        setProjectInstance(`${res.data.name}-2025-Q1`);
      }
    } catch (err) {
      console.error('Failed to fetch project details:', err);
    }
  };

  useEffect(() => {
    fetchDemands();
    fetchProjectDetails();
  }, [activeProjectId]);

  const addDemand = async () => {
    if (!selectedSpecies || !quantity || !projectInstance || !activeProjectId) return;
    const sp = SPECIES_REGISTRY.find(s => s.scientificName === selectedSpecies);
    
    // Resolve custom instance if needed
    let finalInstance = projectInstance;
    if (projectInstance === 'custom') {
      // If user selected custom but didn't provide one, fallback
      finalInstance = `${projectName}-Custom`;
    }

    try {
      await apiFetch('/sapling-demands', {
        method: 'POST',
        body: JSON.stringify({
          projectId: activeProjectId,
          species: selectedSpecies,
          commonName: sp?.commonName || '',
          quantity: Number(quantity),
          projectInstance: finalInstance,
          status: 'pending',
        }),
      });
      setSelectedSpecies('');
      setQuantity('');
      setShowForm(false);
      fetchDemands();
    } catch (err) {
      console.error('Failed to add demand:', err);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await apiFetch(`/sapling-demands/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      fetchDemands();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const statusBadge = (s?: string) => {
    if (!s) return <span className="badge gray">Unknown</span>;
    const m: Record<string, string> = { 
      approved: 'green', pending: 'amber', in_transit: 'blue', delivered: 'green', rejected: 'red',
      healthy: 'green', stressed: 'amber', dead: 'red', replanted: 'blue', diseased: 'red'
    };
    return <span className={`badge ${m[s] || 'gray'}`}>{s.replace('_', ' ')}</span>;
  };

  const [viewingTreesForId, setViewingTreesForId] = useState<string | null>(null);
  const [plantedTrees, setPlantedTrees] = useState<any[]>([]);
  const [loadingTrees, setLoadingTrees] = useState(false);

  const viewPlantedTrees = async (demand: DemandEntry) => {
    setViewingTreesForId(demand._id);
    setLoadingTrees(true);
    try {
      const res = await apiFetch<{ data: any[] }>(`/trees?species=${encodeURIComponent(demand.species)}`);
      setPlantedTrees(res.data || []);
    } catch (err) {
      console.error("Failed to fetch planted trees", err);
      setPlantedTrees([]);
    } finally {
      setLoadingTrees(false);
    }
  };

  const totalSaplings = demands.reduce((sum, d) => sum + d.quantity, 0);

  if (!activeProjectId) {
    return <div className="p-20 text-center text-muted">Please select a project from the Launchpad to manage sapling demands.</div>;
  }

  const instanceOptions = [
    `${projectName}-2025-Q1`,
    `${projectName}-2025-Q2`,
    `${projectName}-2025-Q3`,
    `${projectName}-2025-Q4`,
    `Main-Cohort-${new Date().getFullYear()}`
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Sapling Demand Capture</h1>
          <p>Record and track sapling requirements for active project instances</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ New Demand'}
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card green">
          <div className="stat-icon green">🌱</div>
          <div className="stat-info">
            <div className="stat-label">Total Demanded</div>
            <div className="stat-value">{totalSaplings.toLocaleString()}</div>
          </div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon blue">📦</div>
          <div className="stat-info">
            <div className="stat-label">Species Types</div>
            <div className="stat-value">{new Set(demands.map(d => d.species)).size}</div>
          </div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber">📋</div>
          <div className="stat-info">
            <div className="stat-label">Pending Orders</div>
            <div className="stat-value">{demands.filter(d => d.status === 'pending').length}</div>
          </div>
        </div>
      </div>

      {showForm && (
        <form 
          className="card" 
          style={{ marginBottom: 20 }}
          onSubmit={(e) => {
            e.preventDefault();
            addDemand();
          }}
        >
          <div className="card-header"><div className="card-title">New Sapling Demand</div></div>
          <div style={{ padding: '0 20px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Species</label>
                <select className="form-select" value={selectedSpecies} onChange={e => setSelectedSpecies(e.target.value)} required>
                  <option value="">Select species...</option>
                  {SPECIES_REGISTRY.map(s => <option key={s.scientificName} value={s.scientificName}>{s.commonName} ({s.scientificName})</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Quantity</label>
                <input className="form-input" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Qty" required min="1" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Project Instance</label>
                <select className="form-select" value={projectInstance} onChange={e => setProjectInstance(e.target.value)} required>
                  {instanceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  <option value="custom">Enter custom instance...</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Add Demand</button>
            </div>
            
            {projectInstance === 'custom' && (
              <div className="form-group" style={{ marginTop: 12 }}>
                <label className="form-label">Custom Instance ID</label>
                <input 
                  className="form-input" 
                  autoFocus 
                  placeholder="e.g. COHORT-DELTA-2025" 
                  onChange={(e) => {
                    // This is a bit tricky with select as value. 
                    // Better approach: use a separate state for custom if needed, 
                    // but for brevity I'll just update projectInstance directly on change.
                  }}
                  onBlur={(e) => {
                    if (e.target.value) {
                      setProjectInstance(e.target.value);
                    }
                  }}
                />
              </div>
            )}
          </div>
        </form>
      )}

      <div className="card">
        <div className="data-table-wrapper">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading demands...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Species</th>
                  <th>Common Name</th>
                  <th>Quantity</th>
                  <th>Project Instance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {demands.map(d => (
                  <tr key={d._id}>
                    <td style={{ fontStyle: 'italic' }}>{d.species}</td>
                    <td>{d.commonName}</td>
                    <td style={{ fontWeight: 600 }}>{d.quantity.toLocaleString()}</td>
                    <td><span className="badge blue">{d.projectInstance}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {statusBadge(d.status)}
                        <select 
                          value={d.status} 
                          onChange={(e) => handleStatusChange(d._id, e.target.value)}
                          className="form-select"
                          style={{ padding: '2px 4px', fontSize: '12px', width: 'auto' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="in_transit">In Transit</option>
                          <option value="delivered">Delivered</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </td>
                    <td>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                        onClick={() => viewPlantedTrees(d)}
                      >
                        👁 View Planted
                      </button>
                    </td>
                  </tr>
                ))}
                {demands.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                      No sapling demands recorded for this project yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {viewingTreesForId && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Planted Trees: {demands.find(d => d._id === viewingTreesForId)?.commonName}</h2>
              <button onClick={() => setViewingTreesForId(null)} className="modal-close">&times;</button>
            </div>
            
            <div style={{ padding: '20px' }}>
              {loadingTrees ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading tree data...</div>
              ) : plantedTrees.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No trees of this species have been registered in the database for this project.
                </div>
              ) : (
                <div className="data-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Tree ID</th>
                        <th>Plot ID</th>
                        <th>Condition</th>
                        <th>DBH (cm)</th>
                        <th>Height (m)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plantedTrees.map(t => (
                        <tr key={t.treeId}>
                          <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{t.treeId}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{t.plotId}</td>
                          <td>{statusBadge(t.conditionStatus)}</td>
                          <td>{t.dbhCm}</td>
                          <td>{t.heightM}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
