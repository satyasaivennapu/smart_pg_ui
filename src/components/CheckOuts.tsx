import { useState, useEffect, type FC, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { getCheckinReport, processCheckOut } from '../services/authService';
import './CheckOuts.css';

const CheckOuts: FC = () => {
  const [nameSearch, setNameSearch] = useState('');
  const [roomNoSearch, setRoomNoSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [checkOutDate, setCheckOutDate] = useState(new Date().toISOString().split('T')[0]);
  const [refundAmount, setRefundAmount] = useState<string | number>(0);
  const [paymentMode, setPaymentMode] = useState('CASH');
  const location = useLocation();

  useEffect(() => {
    if (location.state?.name || location.state?.roomNo) {
      const name = location.state.name || '';
      const room = location.state.roomNo || '';
      setNameSearch(name);
      setRoomNoSearch(room);
      triggerAutomaticSearch(name, room);
    }
  }, [location.state]);

  const triggerAutomaticSearch = async (name: string, room: string) => {
    setLoading(true);
    const res = await getCheckinReport({
      tenantId: tenant_id,
      branchId: branch_id,
      name: name,
      roomNo: room,
      fromDate: '2020-01-01',
      toDate: new Date().toISOString().split('T')[0]
    });
    if (res?.success) {
      setResults(res.result || []);
    }
    setLoading(false);
  };

  const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const { tenant_id, branch_id, id: user_id } = savedUser;

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);
    const res = await getCheckinReport({
      tenantId: tenant_id,
      branchId: branch_id,
      name: nameSearch,
      roomNo: roomNoSearch,
      fromDate: '2025-10-01', // Wide range to find active ones
      toDate: new Date().toISOString().split('T')[0]
    });

    if (res?.success) {
      setResults(res.result || []);
    }
    setLoading(false);
  };

  const openVacateModal = (booking: any) => {
    setSelectedBooking(booking);
    setRefundAmount(booking.refundAmt || booking.refund_amount || 0);
    setPaymentMode('CASH');
    setIsModalOpen(true);
  };

  const handleVacate = async () => {
    if (!selectedBooking) return;

    const res = await processCheckOut({
      bookingId: selectedBooking.id || selectedBooking.booking_unique_id,
      checkOutDate,
      refundAmount,
      paymentMode,
      userId: user_id
    });

    if (res?.success) {
      alert(`${res.result.status}. Refund Amount: ${res.result.refund_amount}`);
      setIsModalOpen(false);
      handleSearch({ preventDefault: () => { } } as any); // Refresh results
    } else {
      alert(res.message || 'Checkout failed');
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h2 className="checkout-title">Occupant Check-out (Vacate)</h2>
        <form className="checkout-search-row" onSubmit={handleSearch}>
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
          <button type="submit" className="checkout-search-btn" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      <div className="occupant-grid">
        {results.length === 0 && !loading && (nameSearch || roomNoSearch) && (
          <p style={{ textAlign: 'center', gridColumn: '1/-1', color: '#64748b' }}>No occupants found.</p>
        )}

        {results.map((item) => (
          <div key={item.id || item.booking_unique_id} className="occupant-card">
            <div className="occupant-info">
              <h3>{item.name || item.occupant_name}</h3>
              <p className="occupant-id">ID: {item.id || item.booking_unique_id}</p>
            </div>

            <div className="booking-details">
              <div className="detail-item">
                <span className="detail-label">Room</span>
                <span className="detail-value">{item.room || item.room_no}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Floor</span>
                <span className="detail-value">{item.floor || item.floor_no}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Check-in</span>
                <span className="detail-value">{new Date(item.checkInDate || item.check_in_date).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Deposit</span>
                <span className="detail-value">₹{item.depositAmt || item.deposit_amount}</span>
              </div>
            </div>

            <button className="vacate-btn" onClick={() => openVacateModal(item)}>
              Process Vacate
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="checkout-modal-overlay">
          <div className="checkout-modal">
            <div className="modal-header">
              <h2>Confirm Vacate</h2>
              <p>Are you sure you want to check out <strong>{selectedBooking?.name || selectedBooking?.occupant_name}</strong>?</p>
            </div>

            <div className="modal-form-group">
              <label>Actual Check-out Date</label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
              />
            </div>

            <div className="modal-form-group">
              <label>Refund Amount</label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="Refund Amount"
              />
            </div>

            <div className="modal-form-group">
              <label>Payment Mode</label>
              <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                <option value="CASH">CASH</option>
                <option value="UPI">UPI</option>
                <option value="CARD">CARD</option>
              </select>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="confirm-btn" onClick={handleVacate}>Confirm Vacate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckOuts;