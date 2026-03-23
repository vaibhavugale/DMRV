import { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import './launchpad.css';

export default function ProjectLaunchpad() {
  const { projects, setActiveProjectId, isLoading } = useProject();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    methodology: 'VM0047',
    startDate: '',
    referencePeriodStart: '',
    referencePeriodEnd: ''
  });

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {

      const payload = {
        name: formData.name,
        region: formData.region,
        methodology: formData.methodology,
        startDate: new Date(formData.startDate).toISOString(),
        isActive: true,
        baseline: {
          referencePeriodStart: formData.referencePeriodStart ? new Date(formData.referencePeriodStart).toISOString() : new Date("2010-01-01").toISOString(),
          referencePeriodEnd: formData.referencePeriodEnd ? new Date(formData.referencePeriodEnd).toISOString() : new Date("2019-12-31").toISOString(),
          baselineEmissionsFactorCO2ePerHa: 0
        },
        lcaSettings: {
          transportEmissionsFactorCO2ePerKm: 0.15,
          fertilizerEmissionsFactorCO2ePerKg: 2.5,
          defaultWoodDensity: 0.5
        },
        sdgTargets: [13, 15] // default Climate Action and Life on Land
      };

      // Since we don't have activeProjectId yet, use standard fetch
      const res = await fetch('http://localhost:3333/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      const json = await res.json();
      
      // Select the new project and redirect to Baseline Setup
      setActiveProjectId(json.data._id);
      window.location.href = '/baseline';

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during project creation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <div className="text-[var(--text-muted)]">Loading available projects...</div>
      </div>
    );
  }

  return (
    <div className="fade-in max-w-7xl mx-auto py-12 px-4 dmrv-launchpad">
      {/* Header Section */}
      <div className="text-center mb-24 animate-fade-in px-4">
        <div className="inline-flex items-center justify-center p-4 bg-emerald-50 rounded-[2rem] mb-8 shadow-sm border border-emerald-100/50">
          <span className="text-5xl">🌱</span>
        </div>
        <h1 className="text-7xl font-extrabold text-[#0f172a] mb-8 tracking-tighter">
          DMRV Platform
        </h1>
        <p className="text-xl text-[#64748b] max-w-2xl mx-auto leading-relaxed font-medium">
          Premium Digital Measurement, Reporting & Verification for global agroforestry carbon projects. 
          Manage your environmental assets with precision.
        </p>
      </div>

      {/* Project Actions & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 bg-white/30 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/50 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-[#0f172a] tracking-tight">Active Projects</h2>
          <p className="text-base text-[#64748b] font-medium">Found {projects.length} initialized carbon projects</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary shadow-xl hover:shadow-2xl px-10 py-4 text-base active:scale-95 transform transition-all"
        >
          <span className="text-xl">✨</span>
          Create New Project
        </button>
      </div>

      {/* Projects Table */}
      {projects.length === 0 ? (
        <div className="flex items-center justify-center py-32">
          <div className="empty-state-card p-16 rounded-[3rem] border border-[#e2e8f0] bg-white/80 backdrop-blur-md w-full max-w-3xl relative overflow-hidden text-center shadow-2xl">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">🌳</div>
            <h3 className="text-3xl font-black text-[#1e293b] mb-4 tracking-tight">No projects yet</h3>
            <p className="text-lg text-[#64748b] mb-10 max-w-md mx-auto leading-relaxed">
              Ready to make an impact? Initialize your first carbon sequestration project to begin the tracking workflow.
            </p>
            <button onClick={() => setShowModal(true)} className="btn-primary px-12 py-4">Initialize Project</button>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="project-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Region</th>
                <th>Methodology</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project: any) => (
                <tr key={project._id} className="group">
                  <td>
                    <div className="project-name-cell">
                      <div className="project-icon">🌍</div>
                      <div className="font-bold text-[#1e293b]">{project.name}</div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2 text-[#64748b]">
                      <span>📍</span>
                      {project.region}
                    </div>
                  </td>
                  <td>
                    <span className="methodology-tag">
                      {project.methodology}
                    </span>
                  </td>
                  <td>
                    <div className="status-badge bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      ACTIVE
                    </div>
                  </td>
                  <td>
                    <button 
                      onClick={() => {
                        setActiveProjectId(project._id);
                        window.location.href = '/';
                      }}
                      className="action-btn"
                    >
                      Enter Workspace
                      <span>→</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Enhanced Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay">
          <div className="modal-content max-w-5xl w-full max-h-[90vh] flex flex-col scale-100 shadow-2xl">
            {/* Modal Header */}
            <div className="modal-header flex justify-between items-center shrink-0">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                  🚀
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-[#0f172a]">New Project</h2>
                  <div className="modal-step-indicator">
                    <div className="step-dot active"></div>
                    <div className="step-dot"></div>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#64748b] ml-1">
                      Step 1: Configuration
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="w-10 h-10 rounded-xl hover:bg-slate-100 text-[#94a3b8] hover:text-[#0f172a] flex items-center justify-center transition-all"
              >
                <span className="text-2xl font-light">✕</span>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="overflow-y-auto grow">
              <form className="form-section" onSubmit={handleCreateProject}>
                {error && (
                  <div className="mb-8 p-4 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100 flex items-start gap-4">
                    <span className="text-xl">⚠️</span>
                    <span className="font-medium pt-0.5">{error}</span>
                  </div>
                )}

                {/* Section 1: Project Identity */}
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 bg-[#0f172a] text-white rounded-lg flex items-center justify-center text-xs font-black">
                      01
                    </div>
                    <h3 className="text-lg font-black text-[#0f172a] uppercase tracking-wider">Project Identity</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="input-group">
                      <label className="input-label">Project Name *</label>
                      <p className="input-desc">Give your project a descriptive title</p>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="input-field shadow-sm"
                        placeholder="e.g. Amazonian Reforestation" 
                        required 
                      />
                    </div>
                    
                    <div className="input-group">
                      <label className="input-label">Region/Location *</label>
                      <p className="input-desc">Where is the project located?</p>
                      <input 
                        type="text" 
                        value={formData.region}
                        onChange={(e) => setFormData({...formData, region: e.target.value})}
                        className="input-field shadow-sm"
                        placeholder="e.g. Pará, Brazil" 
                        required 
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-[#f1f5f9] mb-12"></div>

                {/* Section 2: Certification & Dates */}
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 bg-[#0f172a] text-white rounded-lg flex items-center justify-center text-xs font-black">
                      02
                    </div>
                    <h3 className="text-lg font-black text-[#0f172a] uppercase tracking-wider">Standard & Timeline</h3>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="input-group">
                      <label className="input-label">Certification Standard *</label>
                      <p className="input-desc">Select the carbon market methodology</p>
                      <div className="select-wrapper">
                        <select 
                          value={formData.methodology}
                          onChange={(e) => setFormData({...formData, methodology: e.target.value})}
                          className="input-field shadow-sm appearance-none cursor-pointer pr-10"
                        >
                          <option value="VM0047">🌍 Verra VM0047 (AR)</option>
                          <option value="GS_ARR">⭐ Gold Standard ARR</option>
                          <option value="PLAN_VIVO">🌳 Plan Vivo 2.0</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="input-group">
                        <label className="input-label">Start Date *</label>
                        <input 
                          type="date" 
                          value={formData.startDate}
                          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                          className="input-field shadow-sm"
                          required 
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Baseline Start *</label>
                        <input 
                          type="date" 
                          value={formData.referencePeriodStart}
                          onChange={(e) => setFormData({...formData, referencePeriodStart: e.target.value})}
                          className="input-field shadow-sm"
                          required 
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Baseline End *</label>
                        <input 
                          type="date" 
                          value={formData.referencePeriodEnd}
                          onChange={(e) => setFormData({...formData, referencePeriodEnd: e.target.value})}
                          className="input-field shadow-sm"
                          required 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Card */}
                <div className="info-box">
                  <span className="text-2xl">💡</span>
                  <div>
                    <strong className="text-[#0f172a] block mb-1">Coming Up Next</strong>
                    <p className="text-sm text-[#64748b] leading-snug">
                      You'll define boundary geometries and emission factors in the next step.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 mt-12 pt-8 border-t border-[#f1f5f9]">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)} 
                    className="btn-secondary"
                  >
                    Discard
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn-primary"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deploying...
                      </span>
                    ) : (
                      <>
                        <span>Confirm & Continue</span>
                        <span className="text-lg">→</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
