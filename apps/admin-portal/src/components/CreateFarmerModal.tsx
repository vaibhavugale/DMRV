import { useState, useEffect, useRef } from 'react';
import { useProject } from '../context/ProjectContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface CreateFarmerModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateFarmerModal({ onClose, onSuccess }: CreateFarmerModalProps) {
  const { activeProjectId } = useProject();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Map State
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const polygonLayer = useRef<L.LayerGroup | null>(null);
  const [points, setPoints] = useState<L.LatLng[]>([]);
  const [createPlot, setCreatePlot] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    farmerId: `FRM-${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`,
    contact: {
      phone: '',
      address: '',
    },
    socioEconomic: {
      householdSize: 1,
      primaryLivelihood: 'farming',
      genderOfHousehold: 'male',
      educationLevel: 'None',
    },
    consent: {
      fpicGranted: true,
      consentDate: new Date().toISOString().split('T')[0],
    },
    sdgTags: [1, 2, 13, 15],
  });

  useEffect(() => {
    if (!createPlot || !mapRef.current || mapInstance.current) return;

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
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [createPlot]);

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
    
    if (createPlot && points.length > 0 && points.length < 3) {
      setError('Please draw a valid plot area with at least 3 points on the map, or disable plot creation.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 1. Create Farmer
      const farmerPayload = {
        ...formData,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        projectId: activeProjectId,
        status: 'active',
        registrationDate: new Date().toISOString(),
      };

      const farmerResponse = await fetch('https://dmrv-f367.onrender.com/api/farmers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(farmerPayload)
      });
      
      if (!farmerResponse.ok) {
        const errorData = await farmerResponse.json();
        throw new Error(errorData.error || 'Failed to register farmer');
      }

      // 2. Create Plot if enabled and mapped
      if (createPlot && points.length >= 3) {
        const coords = points.map(p => [p.lng, p.lat]);
        coords.push([points[0].lng, points[0].lat]); // close the polygon

        const plotPayload = {
          name: 'Primary Farm',
          plotId: `PLT-${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`,
          farmerId: formData.farmerId,
          areaHectares: 0, // approx
          currentLandUse: formData.socioEconomic.primaryLivelihood,
          verificationStatus: 'unverified',
          projectId: activeProjectId,
          boundary: {
            type: 'Polygon',
            coordinates: [coords]
          },
          baseline: {
            initialSoilCarbonContent: 0,
            existingTreeCount: 0,
            historicalLandUse: 'cropland',
            baselineBiomassCO2e: 0
          }
        };

        const plotResponse = await fetch('https://dmrv-f367.onrender.com/api/plots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(plotPayload)
        });

        if (!plotResponse.ok) {
           console.warn('Farmer created but default plot could not be saved.');
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to register farmer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Register New Farmer</h2>
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
              <label className="form-label">First Name</label>
              <input 
                type="text" 
                value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
                className="form-input" 
                placeholder="e.g. Rajesh" 
                required 
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Last Name</label>
              <input 
                type="text" 
                value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
                className="form-input" 
                placeholder="e.g. Kumar" 
                required 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Phone Number</label>
              <input 
                type="tel" 
                value={formData.contact.phone}
                onChange={e => setFormData({
                  ...formData, 
                  contact: { ...formData.contact, phone: e.target.value }
                })}
                className="form-input" 
                placeholder="e.g. +91 9876543210" 
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Farmer ID (Auto-generated)</label>
              <input 
                type="text" 
                value={formData.farmerId}
                readOnly
                className="form-input" 
                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address / Village</label>
            <textarea 
              value={formData.contact.address}
              onChange={e => setFormData({
                ...formData, 
                contact: { ...formData.contact, address: e.target.value }
              })}
              className="form-textarea" 
              placeholder="e.g. Village Sundara, Karnataka" 
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', marginTop: '8px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '24px', height: '24px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-primary-600)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>2</span>
              Socio-Economic Data
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Household Size</label>
                <input 
                  type="number" 
                  min="1"
                  value={formData.socioEconomic.householdSize}
                  onChange={e => setFormData({
                    ...formData, 
                    socioEconomic: { ...formData.socioEconomic, householdSize: parseInt(e.target.value) || 1 }
                  })}
                  className="form-input" 
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Primary Livelihood</label>
                <input 
                  type="text" 
                  value={formData.socioEconomic.primaryLivelihood}
                  onChange={e => setFormData({
                    ...formData, 
                    socioEconomic: { ...formData.socioEconomic, primaryLivelihood: e.target.value }
                  })}
                  className="form-input" 
                  placeholder="e.g. Farming, Dairy"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Gender of Head of Household</label>
                <select 
                  value={formData.socioEconomic.genderOfHousehold}
                  onChange={e => setFormData({
                    ...formData, 
                    socioEconomic: { ...formData.socioEconomic, genderOfHousehold: e.target.value }
                  })}
                  className="form-select"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">FPIC Consent</label>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.consent.fpicGranted}
                    onChange={e => setFormData({
                      ...formData, 
                      consent: { ...formData.consent, fpicGranted: e.target.checked }
                    })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-600)' }}
                  />
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Consent Granted</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <span style={{ width: '24px', height: '24px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-primary-600)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>3</span>
                Primary Farm Map
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Map First Plot</span>
                <input 
                  type="checkbox" 
                  checked={createPlot}
                  onChange={e => {
                    setCreatePlot(e.target.checked);
                    if (!e.target.checked) setPoints([]);
                  }}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-600)' }}
                />
              </div>
            </div>

            {createPlot && (
              <div style={{ marginBottom: '16px', animation: 'fadeIn 200ms ease' }}>
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
            )}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Registering...' : (createPlot ? 'Register Farmer & Plot' : 'Register Farmer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
