import { useState } from 'react';
import { apiFetch } from '../api';

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'vcs' | 'gs'>('vcs');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [periodStart, setPeriodStart] = useState('2020-01-01');
  const [periodEnd, setPeriodEnd] = useState('2025-12-31');

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ data: any }>(`/reports/vcs-monitoring?periodStart=${periodStart}&periodEnd=${periodEnd}`);
      setReportData(res.data);
    } catch {
      // Use mock data if API is not available
      setReportData({
        reportId: `VCS-RPT-${Date.now()}`,
        projectName: 'Agroforestry DMRV Project',
        standard: 'Verra VCS',
        methodology: 'VM0047 - Afforestation, Reforestation, and Revegetation (ARR)',
        verificationPeriod: { start: periodStart, end: periodEnd },
        summary: {
          totalFarmers: 5,
          totalPlots: 5,
          totalTrees: 20,
          totalAreaHectares: 16.5,
          grossCO2eTonnes: 2.85,
          leakageDeductionPercent: 5,
          nonPermanenceBufferPercent: 15,
          netCreditsTonnes: 2.29,
        },
        leakageAssessment: {
          leakageRiskIdentified: false,
          mitigationMeasures: ['Activity-shifting leakage monitored via satellite', 'Market leakage assessed as negligible for ARR'],
          deduction: 5,
        },
        nonPermanenceRisk: { internalRisk: 5, externalRisk: 5, naturalRisk: 5, totalBuffer: 15 },
        generatedAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Report Generator</h1>
          <p>Generate VCS/Gold Standard monitoring reports following VM0047 methodology</p>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'vcs' ? 'active' : ''}`} onClick={() => setActiveTab('vcs')}>
          Verra VCS Report
        </button>
        <button className={`tab ${activeTab === 'gs' ? 'active' : ''}`} onClick={() => setActiveTab('gs')}>
          Gold Standard Report
        </button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="card-title">Verification Period</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Start Date</label>
            <input className="form-input" type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">End Date</label>
            <input className="form-input" type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={generateReport} disabled={loading}>
            {loading ? '⏳ Generating...' : '📄 Generate Report'}
          </button>
        </div>
      </div>

      {reportData && (
        <div className="dashboard-grid">
          <div className="card full-width">
            <div className="card-header">
              <div>
                <div className="card-title">{reportData.projectName}</div>
                <div className="card-subtitle">{reportData.methodology} | {reportData.standard}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm">📋 Copy JSON</button>
                <button className="btn btn-primary btn-sm">📥 Export PDF</button>
              </div>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <div className="stat-card green">
                <div className="stat-info">
                  <div className="stat-label">Net Credits</div>
                  <div className="stat-value">{reportData.summary.netCreditsTonnes}</div>
                  <div className="stat-change positive">tCO₂e</div>
                </div>
              </div>
              <div className="stat-card amber">
                <div className="stat-info">
                  <div className="stat-label">Gross Sequestration</div>
                  <div className="stat-value">{reportData.summary.grossCO2eTonnes}</div>
                  <div className="stat-change positive">tCO₂e</div>
                </div>
              </div>
              <div className="stat-card red">
                <div className="stat-info">
                  <div className="stat-label">Buffer Deduction</div>
                  <div className="stat-value">{reportData.summary.nonPermanenceBufferPercent}%</div>
                  <div className="stat-change negative">non-permanence</div>
                </div>
              </div>
              <div className="stat-card blue">
                <div className="stat-info">
                  <div className="stat-label">Leakage</div>
                  <div className="stat-value">{reportData.summary.leakageDeductionPercent}%</div>
                  <div className="stat-change negative">deduction</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Non-Permanence Risk</div></div>
            <div className="detail-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="detail-item"><label>Internal Risk</label><span>{reportData.nonPermanenceRisk.internalRisk}%</span></div>
              <div className="detail-item"><label>External Risk</label><span>{reportData.nonPermanenceRisk.externalRisk}%</span></div>
              <div className="detail-item"><label>Natural Risk</label><span>{reportData.nonPermanenceRisk.naturalRisk}%</span></div>
              <div className="detail-item"><label>Total Buffer</label><span style={{ color: 'var(--color-danger-600)', fontWeight: 700 }}>{reportData.nonPermanenceRisk.totalBuffer}%</span></div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Leakage Assessment</div></div>
            <div className="detail-item" style={{ marginBottom: 12 }}>
              <label>Risk Identified</label>
              <span>{reportData.leakageAssessment.leakageRiskIdentified ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <label className="form-label">Mitigation Measures</label>
              <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--text-secondary)' }}>
                {reportData.leakageAssessment.mitigationMeasures.map((m: string, i: number) => (
                  <li key={i} style={{ marginBottom: 6 }}>{m}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card full-width">
            <div className="card-header"><div className="card-title">Raw JSON Payload</div></div>
            <div className="report-preview">
              {JSON.stringify(reportData, null, 2)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
