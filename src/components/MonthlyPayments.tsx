import { useState, useEffect, FC, FormEvent } from 'react';
import { getCheckinReport, addMonthlyPayment } from '../services/authService';
import './MonthlyPayments.css';

const MonthlyPayments: FC = () => {
  const [nameSearch, setNameSearch] = useState('');
  const [roomNoSearch, setRoomNoSearch] = useState('');
  const [occupants, setOccupants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOccupant, setSelectedOccupant] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('CASH');
  const [processing, setProcessing] = useState(false);

  const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const { tenant_id, branch_id, id: user_id } = savedUser;

  const fetchOccupants = async () => {
    setLoading(true);
    const res = await getCheckinReport({
      tenantId: tenant_id,
      branchId: branch_id,
      name: nameSearch,
      roomNo: roomNoSearch,
      fromDate: '2020-01-01',
      toDate: new Date().toISOString().split('T')[0]
    });

    if (res?.success) {
      setOccupants(res.result || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOccupants();
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    fetchOccupants();
  };

  const openPaymentModal = (occ: any) => {
    setSelectedOccupant(occ);
    setAmount(String(occ.totalAmt || occ.monthly_amount || ''));
    setIsModalOpen(true);
  };

  const handlePayment = async () => {
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setProcessing(true);
    const res = await addMonthlyPayment({
      bookingId: selectedOccupant.booking_unique_id || selectedOccupant.id,
      monthlyAmount: amount,
      paymentMode: mode,
      userId: user_id
    });

    if (res?.success) {
      alert('Payment recorded successfully!');
      setIsModalOpen(false);
      fetchOccupants(); // Refresh list
    } else {
      alert(res.message || 'Payment failed');
    }
    setProcessing(false);
  };

  return (
    <div className="monthly-payments-container">
      <div className="mp-header">
        <h2 className="mp-title">Monthly Rent Payments</h2>
        <form className="mp-search-row" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <input 
              type="text" 
              placeholder="Occupant Name..." 
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
            />
          </div>
          <div className="search-input-wrapper">
            <input 
              type="text" 
              placeholder="Room No..." 
              value={roomNoSearch}
              onChange={(e) => setRoomNoSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="mp-search-btn" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      <div className="mp-table-container">
        {loading ? (
          <p className="loading-msg">Loading records...</p>
        ) : (
          <table className="mp-table">
            <thead>
              <tr>
                <th>Occupant</th>
                <th>Room / Bed</th>
                <th>Rent</th>
                <th>Check-in</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {occupants.map((occ, i) => (
                <tr key={i}>
                  <td>
                    <div className="occ-info">
                      <span className="occ-name">{occ.name || occ.occupant_name}</span>
                      <span className="occ-id">#{occ.booking_unique_id || occ.id}</span>
                    </div>
                  </td>
                  <td>
                    <div className="room-info">
                      <span>Room {occ.room || occ.room_no}</span>
                      <span className="bed-no">Bed {occ.bed_no}</span>
                    </div>
                  </td>
                  <td>₹{occ.totalAmt || occ.monthly_amount}</td>
                  <td>{new Date(occ.checkInDate || occ.check_in_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-pill ${occ.paid ? 'paid' : 'unpaid'}`}>
                      {occ.paid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <button className="pay-now-btn" onClick={() => openPaymentModal(occ)}>
                      Record Payment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="mp-modal-overlay">
          <div className="mp-modal">
            <div className="modal-header">
              <h3>Record Payment</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="payment-form">
                <div className="form-group">
                  <label>Occupant</label>
                  <p className="form-static-text">{selectedOccupant?.name || selectedOccupant?.occupant_name}</p>
                </div>
                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Payment Mode</label>
                  <select value={mode} onChange={(e) => setMode(e.target.value)}>
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="CARD">Card</option>
                    <option value="BANK TRANSFER">Bank Transfer</option>
                  </select>
                </div>
                <button 
                  className="confirm-pay-btn" 
                  onClick={handlePayment}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyPayments;
