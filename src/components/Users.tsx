import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { processUser, processTenant, processBranch, getUserRoles } from '../services/authService';
import './Users.css';

interface User {
  id: number;
  name: string;
  mobileNo: string;
  email: string;
  password?: string;
  tenantId: number;
  tenantName?: string;
  branchId: number;
  branchName?: string;
  userTypeId: number;
  roleName?: string;
  isActive: number;
}

interface Tenant { id: number; name: string; }
interface Branch { id: number; name: string; tenantId: number; }
interface Role { id: number; roleName: string; }

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    name: '', mobileNo: '', email: '', password: '', tenantId: 0, branchId: 0, userTypeId: 0, isActive: 1
  });

  const userId = 1; // Logged-in user context

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const [userRes, tenantRes, branchRes, roleRes] = await Promise.all([
      processUser({ crudType: 'GET', userId }),
      processTenant({ crudType: 'GET', userId }),
      processBranch({ crudType: 'GET', userId }),
      getUserRoles({ userId })
    ]);

    if (userRes?.success) {
      // Map snail_case to camelCase
      const mappedUsers = (userRes.result || []).map((u: any) => ({
        id: u.id,
        name: u.name,
        mobileNo: u.phone_no || u.phone_no,
        email: u.email,
        tenantId: u.tenant_id || u.tenantId,
        tenantName: u.tenant_name,
        branchId: u.branch_id || u.branchId,
        branchName: u.branch_name,
        userTypeId: u.role_id || u.user_type_id || u.userTypeId,
        roleName: u.role_name,
        isActive: u.is_active ?? u.isActive
      }));
      setUsers(mappedUsers);
    }

    if (tenantRes?.success) setTenants(tenantRes.result || []);

    if (branchRes?.success) {
      // Map branches too if needed for lookup
      const mappedBranches = (branchRes.result || []).map((b: any) => ({
        id: b.id,
        name: b.name,
        tenantId: b.tenant_id || b.tenantId
      }));
      setBranches(mappedBranches);
    }

    if (roleRes?.success) {
      const mappedRoles = (roleRes.result || []).map((r: any) => ({
        id: r.id,
        roleName: r.name || r.name
      }));
      setRoles(mappedRoles);
    }

    setLoading(false);
  };

  const handleOpenModal = (user?: User, viewOnly: boolean = false) => {
    setIsViewOnly(viewOnly);
    if (user) {
      setFormData({ ...user, password: '' }); // Don't pre-fill password
    } else {
      setFormData({
        name: '', mobileNo: '', email: '', password: '',
        tenantId: tenants[0]?.id || 0,
        branchId: branches[0]?.id || 0,
        userTypeId: roles[0]?.id || 0,
        isActive: 1
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

    // For update, if password is empty, remove it from payload to avoid overwriting with empty
    if (crudType === 'UPDATE' && !formData.password) {
      delete payload.password;
    }

    console.log("Saving User Payload:", payload);
    const res = await processUser(payload);

    if (res?.success) {
      setIsModalOpen(false);
      fetchInitialData();
    } else {
      alert(`Error: ${res?.message || 'Operation failed'}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const res = await processUser({ crudType: 'DELETE', id, userId });
      if (res?.success) {
        alert('User deleted successfully');
        fetchInitialData();
      } else {
        alert(`Error: ${res?.message || 'Operation failed'}`);
      }
    }
  };

  const getFilteredBranches = () => {
    if (!formData.tenantId) return branches;
    return branches.filter(b => b.tenantId === Number(formData.tenantId));
  };

  return (
    <div className="users-container">
      <div className="users-header">
        <h2 className="users-title">Manage Users</h2>
        <button className="btn-primary" onClick={() => handleOpenModal()}>+ Add User</button>
      </div>

      <div className="table-responsive">
        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Tenant</th>
                <th>Branch</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.mobileNo}</td>
                  <td>{u.email}</td>
                  <td>{u.tenantName || tenants.find(t => t.id === u.tenantId)?.name || '-'}</td>
                  <td>{u.branchName || branches.find(b => b.id === u.branchId)?.name || '-'}</td>
                  <td>{u.roleName || roles.find(r => r.id === u.userTypeId)?.roleName || u.userTypeId}</td>
                  <td>
                    <span className={`status-badge ${u.isActive ? 'active' : 'inactive'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="action-btn btn-view" onClick={() => handleOpenModal(u, true)} data-tooltip="View">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                      <button className="action-btn btn-edit" onClick={() => handleOpenModal(u, false)} data-tooltip="Edit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button className="action-btn btn-delete" onClick={() => handleDelete(u.id)} data-tooltip="Delete">
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
              {users.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center">No users found.</td>
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
              <h3>{isViewOnly ? 'View User' : (formData.id ? 'Edit User' : 'Add New User')}</h3>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-row">
                <div className="input-group">
                  <label>Full Name</label>
                  <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required readOnly={isViewOnly} />
                </div>
                <div className="input-group">
                  <label>Mobile Number</label>
                  <input type="text" name="mobileNo" value={formData.mobileNo || ''} onChange={handleChange} required readOnly={isViewOnly} />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Email Address</label>
                  <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required readOnly={isViewOnly} />
                </div>
                <div className="input-group">
                  <label>{formData.id ? 'New Password (leave blank to keep current)' : 'Password'}</label>
                  <input type="password" name="password" value={formData.password || ''} onChange={handleChange} required={!formData.id} readOnly={isViewOnly} />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Select Tenant</label>
                  <select name="tenantId" value={formData.tenantId} onChange={handleChange} required disabled={isViewOnly}>
                    <option value="" disabled>Select Tenant</option>
                    {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Select Branch</label>
                  <select name="branchId" value={formData.branchId} onChange={handleChange} required disabled={isViewOnly}>
                    <option value="" disabled>Select Branch</option>
                    {getFilteredBranches().map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>User Role</label>
                  <select name="userTypeId" value={formData.userTypeId} onChange={handleChange} required disabled={isViewOnly}>
                    <option value="" disabled>Select Role</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.roleName}</option>)}
                  </select>
                </div>
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
                    {formData.id ? 'Update User' : 'Save User'}
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