import { useState, useEffect, useRef } from 'react';
import { useProject } from '../context/ProjectContext';
import { apiFetch } from '../api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface CreatePlotModalProps {
  farmerId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreatePlotModal({ farmerId, onClose, onSuccess }: CreatePlotModalProps) {
  const { activeProjectId } = useProject();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Map State
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const polygonLayer = useRef<L.LayerGroup | null>(null);
  const [points, setPoints] = useState<L.LatLng[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    plotId: `PLT-${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`,
    farmerId: farmerId || '',
    areaHectares: 0,
    currentLandUse: 'agroforestry',
    baseline: {
      initialSoilCarbonContent: 0,
      existingTreeCount: 0,
      historicalLandUse: 'cropland',
      baselineBiomassCO2e: 0
    }
  });

  const [farmers, setFarmers] = useState<any[]>([]);
  const [isLoadingFarmers, setIsLoadingFarmers] = useState(false);

  useEffect(() => {
    if (!activeProjectId) return;
    const fetchFarmers = async () => {
      setIsLoadingFarmers(true);
      try {
        const res = await apiFetch<{ data: any[] }>('/farmers');
        setFarmers(res.data);
      } catch (err) {
        console.error("Failed to fetch farmers", err);
      } finally {
        setIsLoadingFarmers(false);
      }
    };
    fetchFarmers();
  }, [activeProjectId]);

  // Calculate approximate area in hectares using turf or basic math
  // For simplicity, we just use a basic approximation or leave it to manual input 
  // if we don't have turf.js. We'll let the user manually input area for now, 
  // but we store the GeoJSON coordinates from the drawing.

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    });

    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
    });

    const map = L.map(mapRef.current, {
      center: [12.3, 76.9],
      zoom: 15,
      layers: [osm]
    });

    const baseMaps = {
      "Standard": osm,
      "Satellite": satellite
    };

    L.control.layers(baseMaps).addTo(map);

    // Auto-detect location
    map.locate({ setView: true, maxZoom: 16 });
    map.on('locationfound', (e) => {
      L.circleMarker(e.latlng, { radius: 6, color: '#3b82f6', fillColor: '#60a5fa', fillOpacity: 0.8, weight: 2 }).addTo(map);
    });

    // Map click handler to add points
    map.on('click', (e: L.LeafletMouseEvent) => {
      setPoints(prev => [...prev, e.latlng]);
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update polygon when points change
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

      // Add small markers at each point
      points.forEach(p => {
        L.circleMarker(p, { radius: 4, color: '#047857', fillColor: '#fff', fillOpacity: 1, weight: 2 }).addTo(group);
      });
      
      polygonLayer.current = group;
    }
  }, [points]);

  const handleClearMap = () => {
    setPoints([]);
  };

  const handleUndoPoint = () => {
    setPoints(prev => prev.slice(0, -1));
  };

  const handleSearch = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstance.current) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        mapInstance.current.setView([parseFloat(data[0].lat), parseFloat(data[0].lon)], 16);
      }
    } catch (err) {
      console.error("Geocoding failed", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (points.length < 3) {
      setError('Please draw a valid plot area with at least 3 points on the map.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Convert points to GeoJSON format: [[[lng, lat], [lng, lat], ...]]
      // Ensure the first and last point are the same for a closed polygon
      const coords = points.map(p => [p.lng, p.lat]);
      coords.push([points[0].lng, points[0].lat]);

      const payload = {
        ...formData,
        projectId: activeProjectId,
        verificationStatus: 'unverified',
        boundary: {
          type: 'Polygon',
          coordinates: [coords]
        }
      };

      const resp = await apiFetch('/plots', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (!resp || (resp as any).error) {
        throw new Error((resp as any)?.error || 'Failed to create plot');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create plot');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Register New Farm Plot</h2>
          <button onClick={onClose} className="modal-close">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger-600)', borderRadius: '6px', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Plot Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="form-input" 
                placeholder="e.g. Hilltop Farm A" 
                required 
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Farmer</label>
              <select 
                value={formData.farmerId}
                onChange={e => setFormData({...formData, farmerId: e.target.value})}
                className="form-select"
                required 
                disabled={isLoadingFarmers || !!farmerId}
              >
                <option value="">Select Farmer</option>
                {farmers.map((f: any) => (
                  <option key={f.farmerId} value={f.farmerId}>
                    {f.firstName} {f.lastName} ({f.farmerId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Area (Hectares)</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                value={formData.areaHectares}
                onChange={e => setFormData({...formData, areaHectares: parseFloat(e.target.value) || 0})}
                className="form-input" 
                required 
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Current Land Use</label>
              <select 
                value={formData.currentLandUse}
                onChange={e => setFormData({...formData, currentLandUse: e.target.value})}
                className="form-select"
              >
                <option value="agroforestry">Agroforestry</option>
                <option value="cropland">Cropland</option>
                <option value="grassland">Grassland</option>
                <option value="forest">Natural Forest</option>
              </select>
            </div>
          </div>

          {/* MAP DRAWING SECTION */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
              <div>
                <label className="form-label" style={{ marginBottom: '4px' }}>Mark Farm Area Boundary</label>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Click on the map to draw the polygon boundaries of the plot.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={handleUndoPoint} disabled={points.length === 0} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '11px' }}>↺ Undo Point</button>
                <button type="button" onClick={handleClearMap} disabled={points.length === 0} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '11px', color: 'var(--color-danger-600)' }}>✕ Clear All</button>
              </div>
            </div>

            {/* Search Bar */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(e) }}
                className="form-input" 
                placeholder="Search location (e.g., Village Name, District)..." 
                style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
              />
              <button type="button" onClick={handleSearch} className="btn btn-secondary" style={{ padding: '8px 16px' }}>Search</button>
            </div>

            <div 
              ref={mapRef} 
              style={{ height: '300px', width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden', cursor: 'crosshair', zIndex: 10 }}
            />
            {points.length > 0 && points.length < 3 && (
              <div style={{ fontSize: '11px', color: 'var(--color-warning-500)', marginTop: '4px', fontWeight: 600 }}>Needs {3 - points.length} more point(s) to form a polygon.</div>
            )}
            {points.length >= 3 && (
              <div style={{ fontSize: '11px', color: 'var(--color-primary-600)', marginTop: '4px', fontWeight: 600 }}>✓ Valid plot boundary marked.</div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', marginTop: '8px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '24px', height: '24px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-primary-600)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>2</span>
              Baseline Definition (Year 0 State)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Existing Tree Count</label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.baseline.existingTreeCount}
                  onChange={e => setFormData({
                    ...formData, 
                    baseline: { ...formData.baseline, existingTreeCount: parseInt(e.target.value) || 0 }
                  })}
                  className="form-input" 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Soil Carbon (tC/ha)</label>
                <input 
                  type="number" 
                  step="0.1"
                  min="0"
                  value={formData.baseline.initialSoilCarbonContent}
                  onChange={e => setFormData({
                    ...formData, 
                    baseline: { ...formData.baseline, initialSoilCarbonContent: parseFloat(e.target.value) || 0 }
                  })}
                  className="form-input" 
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Historical Land Use</label>
                <select 
                  value={formData.baseline.historicalLandUse}
                  onChange={e => setFormData({
                    ...formData, 
                    baseline: { ...formData.baseline, historicalLandUse: e.target.value as any }
                  })}
                  className="form-select"
                >
                  <option value="cropland">Cropland (Degraded)</option>
                  <option value="grassland">Pasture/Grassland</option>
                  <option value="forest">Existing Secondary Forest</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Baseline Biomass (tCO2e)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={formData.baseline.baselineBiomassCO2e}
                  onChange={e => setFormData({
                    ...formData, 
                    baseline: { ...formData.baseline, baselineBiomassCO2e: parseFloat(e.target.value) || 0 }
                  })}
                  className="form-input" 
                />
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Registering...' : 'Register Farm & Baseline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
