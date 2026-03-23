import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';
import CreateTreeModal from '../components/CreateTreeModal';

interface TreeRecord {
  treeId: string;
  plotId: string;
  farmerId: string;
  speciesScientific: string;
  speciesCommon?: string;
  family: string;
  dbhCm: number;
  heightM: number;
  conditionStatus: string;
  plantingDate: string;
  carbonSequestered?: number;
}

const MOCK_TREES: TreeRecord[] = [
  { treeId: 'TRE-00000001', plotId: 'PLT-00000001', farmerId: 'FRM-00000001', speciesScientific: 'Tectona grandis', speciesCommon: 'Teak', family: 'Lamiaceae', dbhCm: 15.5, heightM: 8.2, conditionStatus: 'healthy', plantingDate: '2022-06-15', carbonSequestered: 0.087 },
  { treeId: 'TRE-00000002', plotId: 'PLT-00000001', farmerId: 'FRM-00000001', speciesScientific: 'Azadirachta indica', speciesCommon: 'Neem', family: 'Meliaceae', dbhCm: 20.0, heightM: 10.5, conditionStatus: 'healthy', plantingDate: '2021-07-20', carbonSequestered: 0.185 },
  { treeId: 'TRE-00000003', plotId: 'PLT-00000001', farmerId: 'FRM-00000001', speciesScientific: 'Mangifera indica', speciesCommon: 'Mango', family: 'Anacardiaceae', dbhCm: 25.0, heightM: 12.0, conditionStatus: 'healthy', plantingDate: '2020-08-10', carbonSequestered: 0.315 },
  { treeId: 'TRE-00000006', plotId: 'PLT-00000003', farmerId: 'FRM-00000002', speciesScientific: 'Cocos nucifera', speciesCommon: 'Coconut Palm', family: 'Arecaceae', dbhCm: 30.0, heightM: 15.0, conditionStatus: 'healthy', plantingDate: '2019-09-20', carbonSequestered: 0.291 },
  { treeId: 'TRE-00000007', plotId: 'PLT-00000003', farmerId: 'FRM-00000002', speciesScientific: 'Psidium guajava', speciesCommon: 'Guava', family: 'Myrtaceae', dbhCm: 10.0, heightM: 5.0, conditionStatus: 'stressed', plantingDate: '2023-01-10', carbonSequestered: 0.032 },
  { treeId: 'TRE-00000008', plotId: 'PLT-00000004', farmerId: 'FRM-00000003', speciesScientific: 'Acacia mangium', speciesCommon: 'Mangium', family: 'Fabaceae', dbhCm: 22.0, heightM: 11.0, conditionStatus: 'healthy', plantingDate: '2022-04-05', carbonSequestered: 0.178 },
  { treeId: 'TRE-00000010', plotId: 'PLT-00000004', farmerId: 'FRM-00000003', speciesScientific: 'Terminalia arjuna', speciesCommon: 'Arjuna', family: 'Combretaceae', dbhCm: 16.0, heightM: 8.0, conditionStatus: 'dead', plantingDate: '2022-03-10', carbonSequestered: 0.0 },
  { treeId: 'TRE-00000012', plotId: 'PLT-00000005', farmerId: 'FRM-00000005', speciesScientific: 'Swietenia macrophylla', speciesCommon: 'Mahogany', family: 'Meliaceae', dbhCm: 28.0, heightM: 14.0, conditionStatus: 'healthy', plantingDate: '2020-05-20', carbonSequestered: 0.392 },
  { treeId: 'TRE-00000011', plotId: 'PLT-00000005', farmerId: 'FRM-00000005', speciesScientific: 'Coffea arabica', speciesCommon: 'Arabica Coffee', family: 'Rubiaceae', dbhCm: 5.0, heightM: 3.0, conditionStatus: 'healthy', plantingDate: '2021-02-15', carbonSequestered: 0.009 },
  { treeId: 'TRE-00000017', plotId: 'PLT-00000004', farmerId: 'FRM-00000003', speciesScientific: 'Ficus religiosa', speciesCommon: 'Peepal', family: 'Moraceae', dbhCm: 35.0, heightM: 18.0, conditionStatus: 'healthy', plantingDate: '2019-12-01', carbonSequestered: 0.620 },
];

export default function Trees() {
  const [trees, setTrees] = useState<TreeRecord[]>(MOCK_TREES);
  const [search, setSearch] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [familyFilter, setFamilyFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchTrees = () => {
    apiFetch<{ data: TreeRecord[] }>('/trees')
      .then(res => setTrees(res.data))
      .catch(() => setTrees(MOCK_TREES));
  };

  useEffect(() => {
    fetchTrees();
  }, []);

  const families = [...new Set(trees.map(t => t.family))].sort();

  const filtered = trees.filter(t => {
    const matchSearch = !search || t.speciesScientific.toLowerCase().includes(search.toLowerCase()) || t.treeId.toLowerCase().includes(search.toLowerCase());
    const matchCondition = !conditionFilter || t.conditionStatus === conditionFilter;
    const matchFamily = !familyFilter || t.family === familyFilter;
    return matchSearch && matchCondition && matchFamily;
  });

  const condBadge = (s: string) => {
    const m: Record<string, string> = { healthy: 'green', stressed: 'amber', dead: 'red', replanted: 'blue', diseased: 'red' };
    return <span className={`badge ${m[s] || 'gray'}`}>{s}</span>;
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Tree Inventory</h1>
          <p>Individual tree records with species, biometrics, and carbon estimates</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>+ Add Tree</button>
      </div>

      {showCreateModal && (
        <CreateTreeModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchTrees}
        />
      )}

      <div className="filters-bar">
        <input className="form-input" placeholder="Search species or tree ID..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-select" value={conditionFilter} onChange={e => setConditionFilter(e.target.value)}>
          <option value="">All Conditions</option>
          <option value="healthy">Healthy</option>
          <option value="stressed">Stressed</option>
          <option value="dead">Dead</option>
          <option value="replanted">Replanted</option>
        </select>
        <select className="form-select" value={familyFilter} onChange={e => setFamilyFilter(e.target.value)}>
          <option value="">All Families</option>
          {families.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tree ID</th>
                <th>Species</th>
                <th>Family</th>
                <th>DBH (cm)</th>
                <th>Height (m)</th>
                <th>Condition</th>
                <th>tCO₂e</th>
                <th>Planted</th>
                <th>Plot</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.treeId}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>
                    <Link to={`/trees/${t.treeId}`} style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>{t.treeId}</Link>
                  </td>
                  <td style={{ fontStyle: 'italic' }}>{t.speciesScientific}</td>
                  <td><span className="badge gray">{t.family}</span></td>
                  <td>{t.dbhCm}</td>
                  <td>{t.heightM}</td>
                  <td>{condBadge(t.conditionStatus)}</td>
                  <td style={{ fontWeight: 600, color: t.carbonSequestered ? 'var(--color-primary-600)' : 'var(--text-muted)' }}>
                    {(t.carbonSequestered || 0).toFixed(4)}
                  </td>
                  <td>{new Date(t.plantingDate).toLocaleDateString()}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{t.plotId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
