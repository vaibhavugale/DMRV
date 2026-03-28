import { useState } from 'react';

interface Farmer {
  farmerId: string;
  firstName: string;
  lastName: string;
  contact: { phone?: string; address?: string };
  socioEconomic: { householdSize: number; primaryLivelihood: string; genderOfHousehold: string };
  consent: { fpicGranted: boolean };
}

interface EditFarmerModalProps {
  farmer: Farmer;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditFarmerModal({ farmer, onClose, onSuccess }: EditFarmerModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: farmer.firstName,
    lastName: farmer.lastName,
    contact: {
      phone: farmer.contact?.phone || '',
      address: farmer.contact?.address || '',
    },
    socioEconomic: {
      householdSize: farmer.socioEconomic?.householdSize || 1,
      primaryLivelihood: farmer.socioEconomic?.primaryLivelihood || 'farming',
      genderOfHousehold: farmer.socioEconomic?.genderOfHousehold || 'male',
    },
    consent: {
      fpicGranted: farmer.consent?.fpicGranted ?? true,
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`https://dmrv-f367.onrender.com/api/farmers/${farmer.farmerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update farmer');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update farmer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Farmer Profile</h2>
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
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input 
              type="tel" 
              value={formData.contact.phone}
              onChange={e => setFormData({
                ...formData, 
                contact: { ...formData.contact, phone: e.target.value }
              })}
              className="form-input" 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea 
              value={formData.contact.address}
              onChange={e => setFormData({
                ...formData, 
                contact: { ...formData.contact, address: e.target.value }
              })}
              className="form-textarea" 
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', marginTop: '8px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Socio-Economic Data</h3>
            
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
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Gender of Household Head</label>
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
                  />
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Consent Granted</span>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Saving...' : 'Update Farmer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
