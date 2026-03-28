import { useState } from 'react';

export default function AuditPortal() {
  const [activeSection, setActiveSection] = useState<'data' | 'evidence' | 'outliers'>('data');
  const [selectedTree, setSelectedTree] = useState<any | null>(null);

  const auditData = {
    dataPipeline: [
      { stage: 'Field Collection', method: 'React Native App + GPS', status: 'verified', records: 20, timestamp: '2024-12-20' },
      { stage: 'Offline Sync', method: 'Queue-based with conflict resolution', status: 'verified', records: 20, timestamp: '2024-12-20' },
      { stage: 'Server Validation', method: 'Species decision tree + Geofencing', status: 'verified', records: 20, timestamp: '2024-12-20' },
      { stage: 'Carbon Calculation', method: 'IPCC Tier-2 / VM0047 AGB formula', status: 'verified', records: 20, timestamp: '2024-12-20' },
      { stage: 'Report Generation', method: 'Automated VCS template mapping', status: 'pending', records: 1, timestamp: 'In progress' },
    ],
    photoEvidence: [
      { treeId: 'TRE-00000001', species: 'Tectona grandis', gps: '12.298°N, 76.898°E', timestamp: '2024-10-05 08:12:34', verified: true, dbh: '12.4 cm', height: '4.2 m', condition: 'Healthy', photoUrl: '/tree_evidence.png' },
      { treeId: 'TRE-00000003', species: 'Mangifera indica', gps: '12.300°N, 76.900°E', timestamp: '2024-10-05 09:45:12', verified: true, dbh: '18.2 cm', height: '3.8 m', condition: 'Healthy', photoUrl: '/tree_evidence.png' },
      { treeId: 'TRE-00000008', species: 'Acacia mangium', gps: '6.445°N, 7.495°E', timestamp: '2024-10-06 07:30:00', verified: true, dbh: '10.1 cm', height: '5.1 m', condition: 'Healthy', photoUrl: '/tree_evidence.png' },
      { treeId: 'TRE-00000012', species: 'Swietenia macrophylla', gps: '15.475°N, -90.365°W', timestamp: '2024-10-10 10:00:00', verified: true, dbh: '14.5 cm', height: '4.7 m', condition: 'Healthy', photoUrl: '/tree_evidence.png' },
    ],
    outliers: [
      { type: 'DBH Anomaly', treeId: 'TRE-00000017', detail: 'DBH of 35cm for Ficus religiosa is in the 95th percentile for the species age class.', severity: 'low', action: 'Reviewed — confirmed, mature specimen.' },
      { type: 'Mortality Event', treeId: 'TRE-00000010', detail: 'Terminalia arjuna marked dead. Mortality date: 2024-11-01.', severity: 'medium', action: 'Buffer pool adjusted. Replanting scheduled.' },
      { type: 'GPS Drift', treeId: 'TRE-00000019', detail: 'Tree coordinates are 15m outside the registered plot boundary PLT-00000003.', severity: 'high', action: 'Pending field verification.' },
    ],
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>VVB Audit Portal</h1>
          <p>Read-only access to the raw data pipeline for third-party verification bodies</p>
        </div>
      </div>

      <div className="audit-banner">
        🔒 <strong>Read-Only Mode</strong> — This portal provides auditors with transparent access to field data, photo evidence, GPS trails, and automated outlier analysis. No data modification is permitted.
      </div>

      <div className="tabs">
        <button className={`tab ${activeSection === 'data' ? 'active' : ''}`} onClick={() => setActiveSection('data')}>📡 Data Pipeline</button>
        <button className={`tab ${activeSection === 'evidence' ? 'active' : ''}`} onClick={() => setActiveSection('evidence')}>📸 Photo Evidence</button>
        <button className={`tab ${activeSection === 'outliers' ? 'active' : ''}`} onClick={() => setActiveSection('outliers')}>⚠️ Outlier Analysis</button>
      </div>

      {activeSection === 'data' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Data Pipeline Stages</div>
              <div className="card-subtitle">End-to-end data flow from field capture to report generation</div>
            </div>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Stage</th><th>Method</th><th>Records</th><th>Status</th><th>Timestamp</th></tr>
              </thead>
              <tbody>
                {auditData.dataPipeline.map((stage, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{stage.stage}</td>
                    <td>{stage.method}</td>
                    <td>{stage.records}</td>
                    <td><span className={`badge ${stage.status === 'verified' ? 'green' : 'amber'}`}>{stage.status}</span></td>
                    <td>{stage.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === 'evidence' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Photo Evidence (EXIF Metadata)</div>
              <div className="card-subtitle">Time-stamped images with embedded GPS coordinates — click for details</div>
            </div>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Tree ID</th><th>Species</th><th>GPS Coordinates</th><th>Timestamp</th><th>EXIF Verified</th></tr>
              </thead>
              <tbody>
                {auditData.photoEvidence.map(p => (
                  <tr key={p.treeId} onClick={() => setSelectedTree(p)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontFamily: 'monospace' }}>{p.treeId}</td>
                    <td style={{ fontStyle: 'italic' }}>{p.species}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{p.gps}</td>
                    <td>{p.timestamp}</td>
                    <td><span className="badge green">✓ Verified</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === 'outliers' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Outlier Analysis</div>
              <div className="card-subtitle">Automated data consistency checks and anomaly detection</div>
            </div>
          </div>
          {auditData.outliers.map((o, i) => (
            <div key={i} style={{
              padding: 16,
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${o.severity === 'high' ? 'rgba(239,68,68,0.3)' : o.severity === 'medium' ? 'rgba(245,158,11,0.3)' : 'var(--border-subtle)'}`,
              marginBottom: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span className={`badge ${o.severity === 'high' ? 'red' : o.severity === 'medium' ? 'amber' : 'gray'}`}>
                  {o.severity.toUpperCase()}
                </span>
                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{o.type}</span>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{o.treeId}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>{o.detail}</div>
              <div style={{ fontSize: 12, color: 'var(--color-primary-600)' }}>Action: {o.action}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tree Detail Modal */}
      {selectedTree && (
        <div className="modal-overlay" onClick={() => setSelectedTree(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Tree Evidence: {selectedTree.treeId}</h2>
              <button className="modal-close" onClick={() => setSelectedTree(null)}>×</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                  <img src={selectedTree.photoUrl} alt="Tree evidence" style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
                <div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Species</label>
                    <div style={{ fontSize: '15px', fontWeight: 600, fontStyle: 'italic' }}>{selectedTree.species}</div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Geographic Info</label>
                    <div style={{ fontSize: '13px', fontFamily: 'monospace' }}>{selectedTree.gps}</div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Collected On</label>
                    <div style={{ fontSize: '13px' }}>{selectedTree.timestamp}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>DBH</label>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{selectedTree.dbh}</div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Height</label>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{selectedTree.height}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Condition</label>
                    <span className="badge green" style={{ marginTop: '4px' }}>{selectedTree.condition}</span>
                  </div>
                </div>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                🛡️ <strong>Integrity Check:</strong> EXIF metadata (GPS/Timestamp) has been verified against field app logs and satellite window. Image hash matches original field submission.
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSelectedTree(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => window.open(selectedTree.photoUrl, '_blank')}>View Original Photo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
