import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useProject } from '../context/ProjectContext';
import CreateFarmerModal from '../components/CreateFarmerModal';

interface Farmer {
  farmerId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  status: string;
  contact: { phone?: string; address?: string };
  socioEconomic: { householdSize: number; primaryLivelihood: string; genderOfHousehold: string };
  consent: { fpicGranted: boolean };
  sdgTags: number[];
  registrationDate: string;
}

const MOCK_FARMERS: Farmer[] = [
  { farmerId: 'FRM-00000001', firstName: 'Rajesh', lastName: 'Kumar', fullName: 'Rajesh Kumar', status: 'active', contact: { phone: '+91-9876543210', address: 'Village Sundara, Karnataka' }, socioEconomic: { householdSize: 5, primaryLivelihood: 'farming', genderOfHousehold: 'male' }, consent: { fpicGranted: true }, sdgTags: [1, 2, 13, 15], registrationDate: '2024-06-15' },
  { farmerId: 'FRM-00000002', firstName: 'Lakshmi', lastName: 'Devi', fullName: 'Lakshmi Devi', status: 'active', contact: { phone: '+91-9876543211', address: 'Village Harihara, Karnataka' }, socioEconomic: { householdSize: 4, primaryLivelihood: 'farming', genderOfHousehold: 'female' }, consent: { fpicGranted: true }, sdgTags: [1, 2, 5, 13, 15], registrationDate: '2024-07-20' },
  { farmerId: 'FRM-00000003', firstName: 'Moses', lastName: 'Okafor', fullName: 'Moses Okafor', status: 'active', contact: { phone: '+234-8012345678', address: 'Enugu State, Nigeria' }, socioEconomic: { householdSize: 7, primaryLivelihood: 'mixed farming', genderOfHousehold: 'male' }, consent: { fpicGranted: true }, sdgTags: [1, 2, 8, 13], registrationDate: '2024-05-10' },
  { farmerId: 'FRM-00000004', firstName: 'Amara', lastName: 'Diallo', fullName: 'Amara Diallo', status: 'pending', contact: { address: 'Sikasso Region, Mali' }, socioEconomic: { householdSize: 6, primaryLivelihood: 'subsistence farming', genderOfHousehold: 'female' }, consent: { fpicGranted: false }, sdgTags: [1, 2, 5], registrationDate: '2024-09-01' },
  { farmerId: 'FRM-00000005', firstName: 'Carlos', lastName: 'Mendoza', fullName: 'Carlos Mendoza', status: 'active', contact: { phone: '+502-45678901', address: 'Alta Verapaz, Guatemala' }, socioEconomic: { householdSize: 4, primaryLivelihood: 'coffee agroforestry', genderOfHousehold: 'male' }, consent: { fpicGranted: true }, sdgTags: [1, 2, 12, 13, 15], registrationDate: '2024-08-01' },
];

export default function Farmers() {
  const [farmers, setFarmers] = useState<Farmer[]>(MOCK_FARMERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  const { activeProjectId, isLoading: contextLoading } = useProject();
  
  const fetchFarmers = () => {
    if (!activeProjectId) return;
    apiFetch<{ data: Farmer[] }>('/farmers')
      .then(res => setFarmers(res.data))
      .catch(() => setFarmers(MOCK_FARMERS));
  };

  useEffect(() => {
    fetchFarmers();
  }, [activeProjectId]);

  if (contextLoading) return <div className="p-8">Loading context...</div>;
  if (!activeProjectId) return (
    <div className="p-20 text-center">
      <h2>No Active Project</h2>
      <p>Please select a project from the Launchpad to view farmers.</p>
      <button className="btn btn-primary mt-4" onClick={() => navigate('/launchpad')}>Go to Launchpad</button>
    </div>
  );

  const filtered = farmers.filter(f => {
    const matchSearch = !search || f.fullName?.toLowerCase().includes(search.toLowerCase()) || f.farmerId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || f.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { active: 'green', pending: 'amber', inactive: 'gray', suspended: 'red' };
    return <span className={`badge ${map[s] || 'gray'}`}>{s}</span>;
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Farmer Registry</h1>
          <p>Manage participating farmer profiles, consent, and SDG data</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>+ Register Farmer</button>
      </div>

      <div className="filters-bar">
        <input
          className="form-input"
          placeholder="Search by name or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="card">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Farmer ID</th>
                <th>Name</th>
                <th>Location</th>
                <th>Status</th>
                <th>FPIC</th>
                <th>SDGs</th>
                <th>Household</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.farmerId} onClick={() => navigate(`/farmers/${f.farmerId}`)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{f.farmerId}</td>
                  <td>{f.fullName || `${f.firstName} ${f.lastName}`}</td>
                  <td>{f.contact.address?.substring(0, 30) || '—'}</td>
                  <td>{statusBadge(f.status)}</td>
                  <td>{f.consent.fpicGranted ? <span className="badge green">✓ Granted</span> : <span className="badge red">✗ Pending</span>}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {f.sdgTags?.slice(0, 4).map(id => <span key={id} className="sdg-tag">{id}</span>)}
                      {(f.sdgTags?.length || 0) > 4 && <span className="sdg-tag">+{f.sdgTags.length - 4}</span>}
                    </div>
                  </td>
                  <td>{f.socioEconomic.householdSize} members</td>
                  <td>{new Date(f.registrationDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {showCreateModal && (
        <CreateFarmerModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchFarmers}
        />
      )}
    </div>
  );
}
