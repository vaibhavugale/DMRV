import { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { apiFetch } from '../api';
import { SPECIES_REGISTRY } from '../constants/species-data';

interface CreateTreeModalProps {
  plotId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTreeModal({ plotId, onClose, onSuccess }: CreateTreeModalProps) {
  const { activeProjectId } = useProject();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    treeId: `TRE-${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`,
    plotId: plotId || '',
    farmerId: '',
    speciesScientific: '',
    speciesCommon: '',
    family: '',
    species: '',
    genus: '',
    dbhCm: 0,
    heightM: 0,
    conditionStatus: 'healthy',
    plantingDate: new Date().toISOString().split('T')[0],
  });

  const [plots, setPlots] = useState<any[]>([]);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (!activeProjectId) return;

    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [plotsRes, farmersRes] = await Promise.all([
          apiFetch<{ data: any[] }>('/plots'),
          apiFetch<{ data: any[] }>('/farmers')
        ]);
        setPlots(plotsRes.data);
        setFarmers(farmersRes.data);

        // If plotId is provided, auto-set farmerId
        if (plotId) {
          const plot = plotsRes.data.find(p => p.plotId === plotId);
          if (plot) {
            setFormData(prev => ({ ...prev, farmerId: plot.farmerId }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch plots or farmers", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [activeProjectId, plotId]);

  const handleFarmerChange = (selectedFarmerId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      farmerId: selectedFarmerId,
      plotId: '' // Clear plot if farmer changes
    }));
  };

  const handlePlotChange = (selectedPlotId: string) => {
    const plot = plots.find(p => p.plotId === selectedPlotId);
    setFormData(prev => ({ 
      ...prev, 
      plotId: selectedPlotId,
      farmerId: plot ? plot.farmerId : prev.farmerId
    }));
  };

  const handleSpeciesChange = (scientificName: string) => {
    const species = SPECIES_REGISTRY.find((s: any) => s.scientificName === scientificName);
    if (species) {
      setFormData(prev => ({
        ...prev,
        speciesScientific: scientificName,
        speciesCommon: species.commonName,
        family: species.family,
        species: species.species || scientificName.split(' ')[1] || '',
        genus: species.genus || scientificName.split(' ')[0] || ''
      }));
    } else {
      setFormData(prev => ({ ...prev, speciesScientific: scientificName }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.plotId) {
      setError('Please provide a Plot ID');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const selectedPlot = plots.find(p => p.plotId === formData.plotId);
      if (!selectedPlot) throw new Error('Selected plot not found');

      const resp = await apiFetch('/trees', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          projectId: activeProjectId,
          farmId: selectedPlot._id, // Map to MongoDB _id
          coordinates: selectedPlot.centroid || { type: 'Point', coordinates: [0, 0] }
        })
      });

      if (!resp || (resp as any).error) {
        throw new Error((resp as any)?.error || 'Failed to register tree');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to register tree');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Register New Tree</h2>
          <button onClick={onClose} className="modal-close">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger-600)', borderRadius: '6px', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tree ID (Auto)</label>
              <input type="text" value={formData.treeId} readOnly className="form-input" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Farmer</label>
              <select
                value={formData.farmerId}
                onChange={e => handleFarmerChange(e.target.value)}
                className="form-select"
                required
                disabled={isLoadingData || !!plotId}
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
              <label className="form-label">Farm Plot</label>
              <select
                value={formData.plotId}
                onChange={e => handlePlotChange(e.target.value)}
                className="form-select"
                required
                disabled={isLoadingData || !!plotId}
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

          <div className="form-group">
            <label className="form-label">Scientific Species Name</label>
            <select
              value={formData.speciesScientific}
              onChange={e => handleSpeciesChange(e.target.value)}
              className="form-select"
              required
            >
              <option value="">Select Species</option>
              {SPECIES_REGISTRY.map((s: any) => (
                <option key={s.scientificName} value={s.scientificName}>
                  {s.scientificName}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Common Name</label>
              <input 
                type="text" 
                value={formData.speciesCommon} 
                onChange={e => setFormData({...formData, speciesCommon: e.target.value})} 
                className="form-input" 
                placeholder="e.g. Teak"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Family</label>
              <input 
                type="text" 
                value={formData.family} 
                onChange={e => setFormData({...formData, family: e.target.value})} 
                className="form-input" 
                placeholder="e.g. Lamiaceae"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">DBH (cm)</label>
              <input 
                type="number" 
                step="0.1"
                value={formData.dbhCm} 
                onChange={e => setFormData({...formData, dbhCm: parseFloat(e.target.value) || 0})} 
                className="form-input" 
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Height (m)</label>
              <input 
                type="number" 
                step="0.1"
                value={formData.heightM} 
                onChange={e => setFormData({...formData, heightM: parseFloat(e.target.value) || 0})} 
                className="form-input" 
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Condition</label>
              <select 
                value={formData.conditionStatus} 
                onChange={e => setFormData({...formData, conditionStatus: e.target.value})} 
                className="form-select"
              >
                <option value="healthy">Healthy</option>
                <option value="stressed">Stressed</option>
                <option value="diseased">Diseased</option>
                <option value="dead">Dead</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Planting Date</label>
            <input 
              type="date" 
              value={formData.plantingDate} 
              onChange={e => setFormData({...formData, plantingDate: e.target.value})} 
              className="form-input" 
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Registering...' : 'Register Tree'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
