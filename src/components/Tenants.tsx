import React, { useState, useEffect } from 'react';
import { processTenant } from '../services/authService';
import './Tenants.css';

interface Tenant {
  id: number;
  name: string;
  code: string;
  email: string;
  mobile_no: string;
  expiry_from: string;
  expiry_to: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export default function Tenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Tenant>>({
    name: '', code: '', email: '', mobile_no: '', expiry_from: '', expiry_to: '', is_active: 1
  });
  const [loading, setLoading] = useState(false);

  // Hardcode userId for now or adjust based on your context/auth integration
  const userId = 1;

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    const payload = { crudType: 'GET', userId };
    console.log("Fetching Tenants Payload:", payload);
    const res = await processTenant(payload);
    if (res?.success) {
      setTenants(res.result || []);
    }
    setLoading(false);
  };

  const [isViewOnly, setIsViewOnly] = useState(false);

  // ... (existing functions)

  const handleOpenModal = (tenant?: Tenant, viewOnly: boolean = false) => {
    setIsViewOnly(viewOnly);
    if (tenant) {
      // Format dates for input type="date"
      setFormData({
        ...tenant,
        expiry_from: tenant.expiry_from ? new Date(tenant.expiry_from).toISOString().split('T')[0] : '',
        expiry_to: tenant.expiry_to ? new Date(tenant.expiry_to).toISOString().split('T')[0] : '',
      });
    } else {
      setFormData({
        name: '', code: '', email: '', mobile_no: '', expiry_from: '', expiry_to: '', is_active: 1
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsViewOnly(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isViewOnly) return;
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewOnly) return;
    const crudType = formData.id ? 'UPDATE' : 'INSERT';
    const payload = { ...formData, crudType, userId };
    
    console.log("Saving Tenant Payload:", payload);
    
    const res = await processTenant(payload);
    if (res?.success) {
      setIsModalOpen(false);
      fetchTenants();
    } else {
      console.error("Save Tenant Error:", res);
      alert(`Error: ${res?.message || 'Operation failed'}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      const payload = { crudType: 'DELETE', id, userId };
      console.log("Deleting Tenant Payload:", payload);
      const res = await processTenant(payload);
      if (res?.success) {
        alert('Tenant deleted successfully');
        fetchTenants();
      } else {
        console.error("Delete Tenant Error:", res);
        alert(`Error: ${res?.message || 'Operation failed'}`);
      }
    }
  };

  return (
    <div className="tenants-container">
      <div className="tenants-header">
        <h2 className="tenants-title">Manage Tenants</h2>
        <button className="btn-primary" onClick={() => handleOpenModal()}>+ Add Tenant</button>
      </div>

      <div className="table-responsive">
        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : (
          <table className="tenants-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Code</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Expiry From</th>
                <th>Expiry To</th>
                {/* <th>Created At</th>
                <th>Updated At</th> */}
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.name}</td>
                  <td>{t.code}</td>
                  <td>{t.email}</td>
                  <td>{t.mobile_no}</td>
                  <td>{t.expiry_from ? new Date(t.expiry_from).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>
                  <td>{t.expiry_to ? new Date(t.expiry_to).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>
                  {/* <td>{t.created_at ? new Date(t.created_at).toLocaleString() : '-'}</td>
                  <td>{t.updated_at ? new Date(t.updated_at).toLocaleString() : '-'}</td> */}
                  <td>
                    <span className={`status-badge ${t.is_active ? 'active' : 'inactive'}`}>
                      {t.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button 
                        className="action-btn btn-view" 
                        onClick={() => handleOpenModal(t, true)}
                        data-tooltip="View"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                      <button 
                         className="action-btn btn-edit" 
                         onClick={() => handleOpenModal(t, false)}
                         data-tooltip="Edit"
                       >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button 
                        className="action-btn btn-delete" 
                        onClick={() => handleDelete(t.id)}
                        data-tooltip="Delete"
                      >
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
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center">No tenants found. Click "+ Add Tenant" to create one.</td>
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
              <h3>{formData.id ? 'Edit Tenant' : 'Add New Tenant'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="tenant-form">
              <div className="form-row">
                <div className="input-group">
                  <label>Name</label>
                  <input type="text" name="name" placeholder="Tenant Name" value={formData.name || ''} onChange={handleChange} required readOnly={isViewOnly} />
                </div>
                <div className="input-group">
                  <label>Code</label>
                  <input type="text" name="code" placeholder="Tenant Code" value={formData.code || ''} onChange={handleChange} required readOnly={isViewOnly} />
                </div>
              </div>
              
              <div className="form-row">
                <div className="input-group">
                  <label>Email</label>
                  <input type="email" name="email" placeholder="Email Address" value={formData.email || ''} onChange={handleChange} required readOnly={isViewOnly} />
                </div>
                <div className="input-group">
                  <label>Mobile Number</label>
                  <input type="text" name="mobile_no" placeholder="Mobile Number" value={formData.mobile_no || ''} onChange={handleChange} required readOnly={isViewOnly} />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Expiry From</label>
                  <input type="date" name="expiry_from" value={formData.expiry_from || ''} onChange={handleChange} required readOnly={isViewOnly} />
                </div>
                <div className="input-group">
                  <label>Expiry To</label>
                  <input type="date" name="expiry_to" value={formData.expiry_to || ''} onChange={handleChange} required readOnly={isViewOnly} />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group checkbox-group">
                  <label className="checkbox-container">
                    <input type="checkbox" name="is_active" checked={Boolean(formData.is_active)} onChange={handleChange} disabled={isViewOnly} />
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
                    {formData.id ? 'Update Tenant' : 'Save Tenant'}
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