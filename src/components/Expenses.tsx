import React, { useState, useEffect } from 'react';
import { manageExpenses } from '../services/authService';
import './Expenses.css';

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    paid_date: new Date().toISOString().split('T')[0]
  });

  const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const branch_id = savedUser.branch_id;

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    const res = await manageExpenses({
      action: 'get',
      branch_id: branch_id
    });
    if (res?.success) {
      setExpenses(res.result || []);
    }
    setLoading(false);
  };

  const handleOpenModal = (expense: any = null) => {
    if (expense) {
      setCurrentExpense(expense);
      setFormData({
        name: expense.name,
        description: expense.description,
        amount: expense.amount.toString(),
        paid_date: expense.paid_date.split('T')[0]
      });
    } else {
      setCurrentExpense(null);
      setFormData({
        name: '',
        description: '',
        amount: '',
        paid_date: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentExpense(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const action = currentExpense ? 'UPDATE' : 'ADD';
    const payload = {
      action,
      id: currentExpense?.id,
      ...formData,
      branch_id: branch_id,
      user_id: savedUser.id
    };

    const res = await manageExpenses(payload);
    if (res?.success) {
      fetchExpenses();
      handleCloseModal();
    } else {
      alert(res.message || 'Action failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      const res = await manageExpenses({
        action: 'DELETE',
        id: id,
        branch_id: branch_id,
        user_id: savedUser.id
      });
      if (res?.success) {
        fetchExpenses();
      } else {
        alert(res.message || 'Delete failed');
      }
    }
  };

  const totalExpense = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  return (
    <div className="expenses-container">
      <div className="expenses-header">
        <h2 className="expenses-title">Expense Management</h2>
        <button className="add-expense-btn" onClick={() => handleOpenModal()}>
          <span>+</span> Add New Expense
        </button>
      </div>

      <div className="expense-summary">
        <div className="summary-card">
          <div className="summary-label">Total Monthly Expenses</div>
          <div className="summary-value">₹{totalExpense.toLocaleString()}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Number of Transactions</div>
          <div className="summary-value">{expenses.length}</div>
        </div>
      </div>

      <div className="expense-list-container">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Loading expenses...</p>
        ) : (
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: '#64748b' }}>No expenses found</td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{(() => {
                      const d = new Date(expense.paid_date);
                      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
                    })()}</td>
                    <td className="expense-name">{expense.name}</td>
                    <td>{expense.description || '-'}</td>
                    <td className="expense-amount">₹{Number(expense.amount).toLocaleString()}</td>
                    <td className="expense-actions">
                      <button className="action-btn edit-btn" onClick={() => handleOpenModal(expense)} title="Edit">
                        ✎
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDelete(expense.id)} title="Delete">
                        🗑
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{currentExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
              <button className="close-btn" onClick={handleCloseModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Expense Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Electricity Bill, Maintenance"
                />
              </div>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="paid_date"
                  value={formData.paid_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Additional details..."
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="submit-btn">{currentExpense ? 'Update' : 'Save'} Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;