import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import CreatePlotModal from '../components/CreatePlotModal';
import EditFarmerModal from '../components/EditFarmerModal';
import CreateActivityModal from '../components/CreateActivityModal';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface FarmerDetailData {
  farmerId: string;
  fullName?: string;
  firstName: string;
  lastName: string;
  status: string;
  contact: { phone?: string; email?: string; address?: string };
  nationalId?: string;
  landTitleDeed?: string;
  registrationDate: string;
  socioEconomic: { 
    householdSize: number; 
    annualIncome?: number; 
    primaryLivelihood: string; 
    educationLevel?: string; 
    accessToCredit?: boolean; 
    genderOfHousehold: string 
  };
  consent: { fpicGranted: boolean; consentDate?: string; witnessName?: string };
  sdgTags: number[];
}

interface Plot {
  _id: string;
  plotId: string;
  farmerId: string;
  name: string;
  areaHectares: number;
  currentLandUse: string;
  verificationStatus: string;
  boundary: { type: string; coordinates: number[][][] };
  centroid?: { type: string; coordinates: number[] };
  plantingDensity?: number;
}

export default function FarmerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [farmer, setFarmer] = useState<FarmerDetailData | null>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'map' | 'list'>('map');
  const [showCreatePlotModal, setShowCreatePlotModal] = useState(false);
  const [showEditFarmerModal, setShowEditFarmerModal] = useState(false);
  const [showCreateActivityModal, setShowCreateActivityModal] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [farmerRes, plotsRes] = await Promise.all([
        apiFetch<{ data: FarmerDetailData }>(`/farmers/${id}`),
        apiFetch<{ data: Plot[] }>(`/plots?farmerId=${id}`)
      ]);
      setFarmer(farmerRes.data);
      setPlots(plotsRes.data);
    } catch (err) {
      console.error('Failed to fetch farmer details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (view !== 'map' || !mapRef.current || mapInstanceRef.current || !plots.length) return;

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    });

    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
    });

    const map = L.map(mapRef.current, {
      center: plots[0].centroid?.coordinates ? [plots[0].centroid.coordinates[1], plots[0].centroid.coordinates[0]] : [12.3, 76.9],
      zoom: 15,
      layers: [osm]
    });

    const baseMaps = {
      "Standard": osm,
      "Satellite": satellite
    };

    L.control.layers(baseMaps).addTo(map);

    const bounds = L.latLngBounds([]);

    plots.forEach((plot: Plot) => {
      if (plot.boundary?.coordinates?.[0]) {
        const latlngs = plot.boundary.coordinates[0].map((c: number[]) => [c[1], c[0]] as [number, number]);
        const polygon = L.polygon(latlngs, {
          color: plot.verificationStatus === 'verified' ? '#10b981' : '#f59e0b',
          fillOpacity: 0.25,
          weight: 2,
        }).addTo(map);

        polygon.bindPopup(`
          <div style="font-family:Inter,sans-serif;font-size:13px">
            <strong>${plot.name}</strong><br/>
            <span>${plot.plotId}</span><br/>
            <span>${plot.areaHectares} ha — ${plot.verificationStatus}</span>
          </div>
        `);

        bounds.extend(polygon.getBounds());
      }
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [view, plots]);

  if (loading) return <div className="p-8">Loading farmer details...</div>;
  if (!farmer) return <div className="p-8">Farmer not found.</div>;

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { 
      'verified': 'green', 'unverified': 'amber', 'flagged': 'red',
      'active': 'green', 'pending': 'amber', 'inactive': 'gray'
    };
    return <span className={`badge ${map[s] || 'gray'}`}>{s}</span>;
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/farmers')}>← Back</button>
            <h1>{farmer.fullName || `${farmer.firstName} ${farmer.lastName}`}</h1>
            <span className={`badge ${farmer.status === 'active' ? 'green' : 'amber'}`}>{farmer.status}</span>
          </div>
          <p>Farmer ID: {farmer.farmerId}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => setShowCreateActivityModal(true)}>Log Activity</button>
          <button className="btn btn-primary" onClick={() => setShowEditFarmerModal(true)}>Edit Profile</button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-item"><label>Full Name</label><span>{farmer.fullName || `${farmer.firstName} ${farmer.lastName}`}</span></div>
        <div className="detail-item"><label>Phone</label><span>{farmer.contact.phone || '—'}</span></div>
        <div className="detail-item"><label>Address</label><span>{farmer.contact.address || '—'}</span></div>
        <div className="detail-item"><label>National ID</label><span>{farmer.nationalId || '—'}</span></div>
        <div className="detail-item"><label>Land Title Deed</label><span>{farmer.landTitleDeed || '—'}</span></div>
        <div className="detail-item"><label>Registration Date</label><span>{new Date(farmer.registrationDate).toLocaleDateString()}</span></div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header"><div className="card-title">Socio-Economic Profile</div></div>
          <div className="detail-grid">
            <div className="detail-item"><label>Household Size</label><span>{farmer.socioEconomic.householdSize} members</span></div>
            <div className="detail-item"><label>Annual Income</label><span>₹{farmer.socioEconomic.annualIncome?.toLocaleString() || '—'}</span></div>
            <div className="detail-item"><label>Primary Livelihood</label><span>{farmer.socioEconomic.primaryLivelihood}</span></div>
            <div className="detail-item"><label>Education Level</label><span>{farmer.socioEconomic.educationLevel || '—'}</span></div>
            <div className="detail-item"><label>Access to Credit</label><span>{farmer.socioEconomic.accessToCredit ? 'Yes' : 'No'}</span></div>
            <div className="detail-item"><label>Gender of Household Head</label><span>{farmer.socioEconomic.genderOfHousehold}</span></div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Consent & SDGs</div></div>
          <div className="detail-grid">
            <div className="detail-item">
              <label>FPIC Status</label>
              <span>{farmer.consent.fpicGranted ? '✅ Granted' : '❌ Pending'}</span>
            </div>
            <div className="detail-item"><label>Consent Date</label><span>{farmer.consent.consentDate ? new Date(farmer.consent.consentDate).toLocaleDateString() : '—'}</span></div>
            <div className="detail-item"><label>Witness</label><span>{farmer.consent.witnessName || '—'}</span></div>
          </div>
          <div style={{ marginTop: 16 }}>
            <label className="form-label">SDG Contributions</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {farmer.sdgTags?.map(tag => (
                <span key={tag} className="sdg-tag" style={{ width: 32, height: 32, fontSize: 12 }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="card-title">Farm Plots</div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Polygons and baseline data for this farmer</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreatePlotModal(true)}>➕ Register Plot</button>
            <div style={{ width: 1, background: 'var(--border-subtle)', margin: '0 4px' }}></div>
            <button className={`btn btn-sm ${view === 'map' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('map')}>🗺️</button>
            <button className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('list')}>📋</button>
          </div>
        </div>

        {view === 'map' ? (
          <div style={{ padding: 0, overflow: 'hidden' }}>
            <div ref={mapRef} className="map-container" style={{ height: 400, borderRadius: 'var(--radius-lg)' }}></div>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Plot ID</th><th>Name</th><th>Area (ha)</th><th>Land Use</th><th>Density</th><th>Status</th></tr>
              </thead>
              <tbody>
                {plots.map((p: Plot) => (
                  <tr key={p.plotId} onClick={() => navigate(`/plots/${p.plotId}`)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.plotId}</td>
                    <td>{p.name}</td>
                    <td>{p.areaHectares}</td>
                    <td><span className="badge green">{p.currentLandUse}</span></td>
                    <td>{p.plantingDensity || '—'} trees/ha</td>
                    <td>{statusBadge(p.verificationStatus)}</td>
                  </tr>
                ))}
                {plots.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No plots registered.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreatePlotModal && <CreatePlotModal farmerId={farmer.farmerId} onClose={() => setShowCreatePlotModal(false)} onSuccess={fetchData} />}
      {showEditFarmerModal && <EditFarmerModal farmer={farmer as any} onClose={() => setShowEditFarmerModal(false)} onSuccess={fetchData} />}
      {showCreateActivityModal && <CreateActivityModal farmerId={farmer.farmerId} onClose={() => setShowCreateActivityModal(false)} onSuccess={fetchData} />}
    </div>
  );
}
