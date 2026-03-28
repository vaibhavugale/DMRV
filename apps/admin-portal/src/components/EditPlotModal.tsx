import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';

interface Plot {
  plotId: string;
  name: string;
  areaHectares: number;
  currentLandUse: string;
  boundary: { type: string; coordinates: number[][][] };
}

interface EditPlotModalProps {
  plot: Plot;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditPlotModal({ plot, onClose, onSuccess }: EditPlotModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Map State
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const polygonLayer = useRef<L.LayerGroup | null>(null);
  const [points, setPoints] = useState<L.LatLng[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    name: plot.name,
    areaHectares: plot.areaHectares,
    currentLandUse: plot.currentLandUse,
  });

  useEffect(() => {
    // Initialize points from existing boundary
    if (plot.boundary?.coordinates?.[0]) {
      const existingPoints = plot.boundary.coordinates[0]
        .slice(0, -1) // remove the closing point duplicant
        .map(coord => L.latLng(coord[1], coord[0]));
      setPoints(existingPoints);
    }
  }, [plot]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [12.3, 76.9],
      zoom: 15,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points));
    }

    map.on('click', (e: L.LeafletMouseEvent) => {
      setPoints(prev => [...prev, e.latlng]);
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Use a ref for map instance to avoid re-init but handle points correctly
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapInstance.current) return;

    if (polygonLayer.current) {
      mapInstance.current.removeLayer(polygonLayer.current);
    }

    if (points.length > 0) {
      const group = L.layerGroup().addTo(mapInstance.current);

      L.polygon(points, {
        color: '#10b981',
        fillColor: '#34d399',
        fillOpacity: 0.4,
        weight: 3
      }).addTo(group);

      points.forEach(p => {
        L.circleMarker(p, { radius: 4, color: '#047857', fillColor: '#fff', fillOpacity: 1, weight: 2 }).addTo(group);
      });
      
      polygonLayer.current = group;
    }
  }, [points]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (points.length < 3) {
      setError('Please draw a valid plot area.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const coords = points.map(p => [p.lng, p.lat]);
      coords.push([points[0].lng, points[0].lat]);

      const response = await fetch(`https://dmrv-f367.onrender.com/api/plots/${plot.plotId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          boundary: {
            type: 'Polygon',
            coordinates: [coords]
          }
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update plot');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update plot');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Plot: {plot.plotId}</h2>
          <button onClick={onClose} className="modal-close">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger-600)', borderRadius: '6px', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Plot Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="form-input" 
                required 
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Area (Hectares)</label>
              <input 
                type="number" 
                step="0.01"
                value={formData.areaHectares}
                onChange={e => setFormData({...formData, areaHectares: parseFloat(e.target.value) || 0})}
                className="form-input" 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Current Land Use</label>
            <select 
              value={formData.currentLandUse}
              onChange={e => setFormData({...formData, currentLandUse: e.target.value})}
              className="form-select"
            >
              <option value="agroforestry">Agroforestry</option>
              <option value="cropland">Cropland</option>
              <option value="grassland">Grassland</option>
              <option value="forest">Forest</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">Boundary (Redraw on Map)</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <button type="button" onClick={() => setPoints([])} className="btn btn-secondary btn-sm">Clear Map</button>
              <button type="button" onClick={() => setPoints(prev => prev.slice(0, -1))} className="btn btn-secondary btn-sm">Undo Point</button>
            </div>
            <div ref={mapRef} style={{ height: '300px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }} />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Saving...' : 'Update Plot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
