import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { processBranch, processTenant } from '../services/authService';
import './Branches.css';

interface Branch {
  id: number;
  name: string;
  code: string;
  tenantId: number;
  tenantName?: string;
  noOfFloors: number;
  agreementFrom: string;
  agreementTo: string;
  isActive: number;
}

interface Tenant {
  id: number;
  name: string;
}

export default function Branches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Branch>>({
    name: '', code: '', tenantId: 0, noOfFloors: 0, agreementFrom: '', agreementTo: '', isActive: 1
  });

  const userId = 1; // Adjust based on auth context

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Fetch both branches and tenants
    const [branchRes, tenantRes] = await Promise.all([
      processBranch({ crudType: 'GET', userId }),
      processTenant({ crudType: 'GET', userId })
    ]);

    if (branchRes?.success) {
      // Map snake_case from DB to camelCase for state
      const mappedBranches = (branchRes.result || []).map((b: any) => ({
        id: b.id,
        name: b.name,
        code: b.code,
        tenantId: b.tenant_id,
        tenantName: b.tenant_name,
        noOfFloors: b.no_of_floors,
        agreementFrom: b.agreement_from,
        agreementTo: b.agreement_to,
        isActive: b.is_active
      }));
      setBranches(mappedBranches);
    }
    if (tenantRes?.success) {
      setTenants(tenantRes.result || []);
    }
    setLoading(false);
  };

  const handleOpenModal = (branch?: Branch, viewOnly: boolean = false) => {
    setIsViewOnly(viewOnly);
    if (branch) {
      setFormData({
        ...branch,
        agreementFrom: branch.agreementFrom ? new Date(branch.agreementFrom).toISOString().split('T')[0] : '',
        agreementTo: branch.agreementTo ? new Date(branch.agreementTo).toISOString().split('T')[0] : '',
      });
    } else {
      setFormData({
        name: '', code: '', tenantId: tenants[0]?.id || 0, noOfFloors: 0, agreementFrom: '', agreementTo: '', isActive: 1
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsViewOnly(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (isViewOnly) return;
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked ? 1 : 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isViewOnly) return;
    
    const crudType = formData.id ? 'UPDATE' : 'INSERT';
    const payload = { ...formData, crudType, userId };
    
    console.log("Saving Branch Payload:", payload);
    const res = await processBranch(payload);
    
    if (res?.success) {
      setIsModalOpen(false);
      fetchData();
    } else {
      console.error("Save Branch Error:", res);
      alert(`Error: ${res?.message || 'Operation failed'}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      const payload = { crudType: 'DELETE', id, userId };
      console.log("Deleting Branch Payload:", payload);
      const res = await processBranch(payload);
      if (res?.success) {
        alert('Branch deleted successfully');
        fetchData();
      } else {
        console.error("Delete Branch Error:", res);
        alert(`Error: ${res?.message || 'Operation failed'}`);
      }
    }
  };

  const getTenantName = (id: number) => {
    return tenants.find(t => t.id === id)?.name || `ID: ${id}`;
  };

  return (
    <div className="branches-container">
      <div className="branches-header">
        <h2 className="branches-title">Manage Branches</h2>
        <button className="btn-primary" onClick={() => handleOpenModal()}>+ Add Branch</button>
      </div>

      <div className="table-responsive">
        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : (
          <table className="branches-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Code</th>
                <th>Tenant</th>
                <th>Floors</th>
                <th>Agreement From</th>
                <th>Agreement To</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((b) => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{b.name}</td>
                  <td>{b.code}</td>
                  <td>{b.tenantName || getTenantName(b.tenantId)}</td>
                  <td>{b.noOfFloors}</td>
                  <td>{b.agreementFrom ? new Date(b.agreementFrom).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>
                  <td>{b.agreementTo ? new Date(b.agreementTo).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>
                  <td>
                    <span className={`status-badge ${b.isActive ? 'active' : 'inactive'}`}>
                      {b.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="action-btn btn-view" onClick={() => handleOpenModal(b, true)} data-tooltip="View">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                      <button className="action-btn btn-edit" onClick={() => handleOpenModal(b, false)} data-tooltip="Edit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button className="action-btn btn-delete" onClick={() => handleDelete(b.id)} data-tooltip="Delete">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {branches.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center">No branches found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content fade-in">
            <div className="modal-header">
              <h3>{isViewOnly ? 'View Branch' : (formData.id ? 'Edit Branch' : 'Add New Branch')}</h3>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="branch-form">
              <div className="form-row">
                <div className="input-group">
                  <label>Branch Name</label>
                  <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required readOnly={isViewOnly} />
                </div>
                <div className="input-group">
                  <label>Branch Code</label>
                  <input type="text" name="code" value={formData.code || ''} onChange={handleChange} required readOnly={isViewOnly} />
                </div>
              </div>
              
              <div className="form-row">
                <div className="input-group">
                  <label>Select Tenant</label>
                  <select name="tenantId" value={formData.tenantId} onChange={handleChange} required disabled={isViewOnly}>
                    <option value="" disabled>Select Tenant</option>
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Number of Floors</label>
                  <input type="number" name="noOfFloors" value={formData.noOfFloors || ''} onChange={handleChange} required readOnly={isViewOnly} />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Agreement From</label>
                  <input type="date" name="agreementFrom" value={formData.agreementFrom || ''} onChange={handleChange} required readOnly={isViewOnly} />
                </div>
                <div className="input-group">
                  <label>Agreement To</label>
                  <input type="date" name="agreementTo" value={formData.agreementTo || ''} onChange={handleChange} required readOnly={isViewOnly} />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group checkbox-group">
                  <label className="checkbox-container">
                    <input type="checkbox" name="isActive" checked={Boolean(formData.isActive)} onChange={handleChange} disabled={isViewOnly} />
                    <span className="checkmark"></span>
                    Is Active
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  {isViewOnly ? 'Close' : 'Cancel'}
                </button>
                {!isViewOnly && (
                  <button type="submit" className="btn-save">
                    {formData.id ? 'Update Branch' : 'Save Branch'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}