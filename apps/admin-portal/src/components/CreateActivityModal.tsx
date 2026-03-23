import { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { apiFetch } from '../api';

interface CreateActivityModalProps {
  farmerId?: string;
  plotId?: string;
  treeId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateActivityModal({ farmerId, plotId, treeId, onClose, onSuccess }: CreateActivityModalProps) {
  const { activeProjectId } = useProject();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    activityId: `ACT-${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`,
    farmerId: farmerId || '',
    plotId: plotId || '',
    treeId: treeId || '',
    type: 'maintenance',
    description: '',
    timestamp: new Date().toISOString().split('T')[0] + 'T' + new Date().toTimeString().split(' ')[0],
    performedBy: 'ADMIN-PORTAL',
    isTreeWise: (!!treeId || true) as boolean
  });

  const [farmers, setFarmers] = useState<any[]>([]);
  const [plots, setPlots] = useState<any[]>([]);
  const [trees, setTrees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!activeProjectId) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [farmersRes, plotsRes, treesRes] = await Promise.all([
          apiFetch<{ data: any[] }>('/farmers'),
          apiFetch<{ data: any[] }>('/plots'),
          apiFetch<{ data: any[] }>('/trees')
        ]);
        setFarmers(farmersRes.data);
        setPlots(plotsRes.data);
        setTrees(treesRes.data);
      } catch (err) {
        console.error("Failed to fetch data for activity modal", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [activeProjectId]);

  const handleTreeChange = (selectedTreeId: string) => {
    const tree = trees.find(t => t.treeId === selectedTreeId);
    if (tree) {
      setFormData(prev => ({
        ...prev,
        treeId: selectedTreeId,
        plotId: tree.plotId,
        farmerId: tree.farmerId
      }));
    } else {
      setFormData(prev => ({ ...prev, treeId: selectedTreeId }));
    }
  };

  const handleFarmerChange = (selectedFarmerId: string) => {
    setFormData(prev => ({
      ...prev,
      farmerId: selectedFarmerId,
      plotId: '',
      treeId: ''
    }));
  };

  const handlePlotChange = (selectedPlotId: string) => {
    const plot = plots.find(p => p.plotId === selectedPlotId);
    if (plot) {
      setFormData(prev => ({
        ...prev,
        plotId: selectedPlotId,
        farmerId: plot.farmerId,
        treeId: '' // Clear tree if plot changes
      }));
    } else {
      setFormData(prev => ({ ...prev, plotId: selectedPlotId, treeId: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.farmerId || !formData.plotId) {
      setError('Please provide Farmer ID and Plot ID');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const resp = await apiFetch('/activities', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          projectId: activeProjectId,
        })
      });

      if (!resp || (resp as any).error) {
        throw new Error((resp as any)?.error || 'Failed to log activity');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to log activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Log Field Activity</h2>
          <button onClick={onClose} className="modal-close">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger-600)', borderRadius: '6px', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="radio" 
                checked={formData.isTreeWise === true} 
                onChange={() => setFormData({...formData, isTreeWise: true})} 
              />
              <span style={{ fontWeight: 500 }}>🌲 Tree-wise Activity</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="radio" 
                checked={formData.isTreeWise === false} 
                onChange={() => setFormData({...formData, isTreeWise: false, treeId: ''})} 
              />
              <span style={{ fontWeight: 500 }}>🚜 Overall/Plot-level</span>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Farmer</label>
              <select 
                value={formData.farmerId} 
                onChange={e => handleFarmerChange(e.target.value)} 
                className="form-select"
                required
                disabled={isLoading || !!farmerId}
              >
                <option value="">Select Farmer</option>
                {farmers.map((f: any) => (
                  <option key={f.farmerId} value={f.farmerId}>
                    {f.firstName} {f.lastName} ({f.farmerId})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Plot</label>
              <select 
                value={formData.plotId} 
                onChange={e => handlePlotChange(e.target.value)} 
                className="form-select"
                required
                disabled={isLoading || !!plotId}
              >
                <option value="">Select Plot</option>
                {plots
                  .filter(p => !formData.farmerId || p.farmerId === formData.farmerId)
                  .map((p: any) => (
                    <option key={p.plotId} value={p.plotId}>
                      {p.name} ({p.plotId})
                    </option>
                  ))
                }
              </select>
            </div>
          </div>

          {formData.isTreeWise && (
            <div className="form-group">
              <label className="form-label">Tree</label>
              <select 
                value={formData.treeId} 
                onChange={e => handleTreeChange(e.target.value)} 
                className="form-select"
                required={formData.isTreeWise}
                disabled={isLoading || !!treeId}
              >
                <option value="">Select Tree</option>
                {trees
                  .filter(t => (!formData.plotId || t.plotId === formData.plotId) && (!formData.farmerId || t.farmerId === formData.farmerId))
                  .map((t: any) => (
                    <option key={t.treeId} value={t.treeId}>
                      {t.speciesCommon || t.speciesScientific} ({t.treeId})
                    </option>
                  ))
                }
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Activity Type</label>
            <select 
              value={formData.type} 
              onChange={e => setFormData({...formData, type: e.target.value})} 
              className="form-select"
            >
              <option value="planting">🌱 Planting</option>
              <option value="maintenance">🔧 Maintenance</option>
              <option value="monitoring">📊 Monitoring</option>
              <option value="irrigation">💧 Irrigation</option>
              <option value="pest_control">🐛 Pest Control</option>
              <option value="pruning">✂️ Pruning</option>
              <option value="replanting">🔄 Replanting</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              className="form-textarea" 
              placeholder="Describe the activity performed..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Date & Time</label>
            <input 
              type="datetime-local" 
              value={formData.timestamp.substring(0, 16)} 
              onChange={e => setFormData({...formData, timestamp: e.target.value + ':00Z'})} 
              className="form-input" 
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Logging...' : 'Log Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
