import { useState, useEffect, FC } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getDashboard, getCheckinReport, addMonthlyPayment } from '../services/authService';
import './Dashboard.css';

const Dashboard: FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState<string>('All');
  const navigate = useNavigate();

  // Occupant Modal States
  const [isOccupantModalOpen, setIsOccupantModalOpen] = useState(false);
  const [occupants, setOccupants] = useState<any[]>([]);
  const [loadingOccupants, setLoadingOccupants] = useState(false);

  // Payment Modal States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOccupant, setSelectedOccupant] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return;

    const user = JSON.parse(savedUser);
    setLoading(true);
    const res = await getDashboard({
      tenantId: user.tenant_id,
      branchId: user.branch_id
    });

    if (res?.success) {
      setData(res.dashboard);
    }
    setLoading(false);
  };

  if (loading) return <div className="loading-state">Loading amazing dashboard...</div>;
  if (!data) return <div className="error-state">Failed to load dashboard.</div>;

  const { rooms, roomsInfo, finance, roomBasedSummary } = data;
  const totals = roomsInfo?.[0] || {};

  // Financial Data for Bar Chart
  const financialData = [
    { name: 'Paid', amount: finance.paid_today, color: '#10b981' },
    { name: 'Deposit', amount: finance.deposit_amount_today, color: '#6366f1' },
    { name: 'Expenses', amount: finance.today_expenses, color: '#ef4444' },
    { name: 'Refunds', amount: finance.refund_amount_today, color: '#f59e0b' }
  ];

  const occupancyData = [
    { name: 'Booked', value: Number(totals.booked_beds || 0), color: '#ef4444' },
    { name: 'Available', value: Number(totals.available_beds || 0), color: '#10b981' },
    { name: 'Blocked', value: Number(totals.blocked_beds || 0), color: '#8b5cf6' }
  ].filter(item => item.value > 0);

  // Get unique floors for dropdown
  const floors = Array.from(new Set((roomBasedSummary || []).map((r: any) => r.floor_no))).sort((a: any, b: any) => a - b);

  // Filter rooms from roomBasedSummary
  const filteredRooms = (roomBasedSummary || []).filter((r: any) =>
    selectedFloor === 'All' || String(r.floor_no) === selectedFloor
  );

  // Group by Type for the selected floor (or all)
  const roomsByType = filteredRooms.reduce((acc: any, room: any) => {
    const type = room.room_type || 'General';
    if (!acc[type]) acc[type] = [];
    acc[type].push({
      ...room,
      capacity: Number(room.room_capacity),
      booked: Number(room.booked_beds),
      available: Number(room.available_beds),
      blocked: Number(room.blocked_beds || 0)
    });
    return acc;
  }, {});

  const renderRoomCircle = (room: any) => {
    const { capacity, booked, available, blocked } = room;
    const total = capacity;

    // Create segments for the conic gradient
    let currentAngle = 0;
    const segments = [];

    // Booked (Red)
    if (booked > 0) {
      const angle = (booked / total) * 360;
      segments.push(`#ef4444 ${currentAngle}deg ${currentAngle + angle}deg`);
      currentAngle += angle;
    }
    // Blocked (Purple)
    if (blocked > 0) {
      const angle = (blocked / total) * 360;
      segments.push(`#8b5cf6 ${currentAngle}deg ${currentAngle + angle}deg`);
      currentAngle += angle;
    }
    // Available (Green)
    if (available > 0) {
      const angle = (available / total) * 360;
      segments.push(`#10b981 ${currentAngle}deg ${currentAngle + angle}deg`);
      currentAngle += angle;
    }

    const gradient = `conic-gradient(${segments.join(', ')})`;

    return (
      <div className="room-circle-container" onClick={() => handleRoomClick(room.room_no)}>
        <div className="room-circle" style={{ background: gradient }}>
          <div className="room-circle-inner">
            <span className="room-circle-no">{room.room_no}</span>
          </div>
        </div>
        <div className="room-circle-label">{room.capacity} Share</div>
      </div>
    );
  };

  const handleRoomClick = async (roomNo: string) => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setLoadingOccupants(true);
    setIsOccupantModalOpen(true);

    const res = await getCheckinReport({
      tenantId: savedUser.tenant_id,
      branchId: savedUser.branch_id,
      roomNo: roomNo,
      fromDate: '2020-01-01',
      toDate: new Date().toISOString().split('T')[0]
    });

    if (res?.success) {
      setOccupants(res.result || []);
    }
    setLoadingOccupants(false);
  };

  const handleCheckoutNav = (occ: any) => {
    navigate('/checkouts', { state: { name: occ.name || occ.occupant_name, roomNo: occ.room || occ.room_no } });
  };

  const openPaymentModal = (occ: any) => {
    setSelectedOccupant(occ);
    setPaymentAmount(String(occ.totalAmt || occ.monthly_amount || ''));
    setIsPaymentModalOpen(true);
  };

  const handleProcessPayment = async () => {
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setProcessingPayment(true);

    const res = await addMonthlyPayment({
      bookingId: selectedOccupant.booking_unique_id || selectedOccupant.id,
      monthlyAmount: paymentAmount,
      paymentMode: paymentMode,
      userId: savedUser.id
    });

    if (res?.success) {
      alert('Payment added successfully!');
      setIsPaymentModalOpen(false);
      // Optionally refresh something or just close
    } else {
      alert(res.message || 'Payment failed');
    }
    setProcessingPayment(false);
  };

  return (
    <div className="dashboard-container">
      {/* Top Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card highlight-green">
          <span className="stat-label">Total Available Beds</span>
          <span className="stat-value">{totals.available_beds}</span>
          <div className="stat-trend">Ready for occupancy</div>
        </div>
        <div className="stat-card highlight-red">
          <span className="stat-label">Total Booked Beds</span>
          <span className="stat-value">{totals.booked_beds}</span>
          <div className="stat-trend">Currently occupied</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Capacity</span>
          <span className="stat-value">{totals.total_beds}</span>
          <div className="stat-trend">Beds across all floors</div>
        </div>
        <div className="stat-card highlight-purple">
          <span className="stat-label">Blocked Beds</span>
          <span className="stat-value">{totals.blocked_beds || 0}</span>
          <div className="stat-trend">Maintenance / Reserved</div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h3 className="chart-title">Occupancy Split</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={occupancyData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {occupancyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Financial Activity (Today)</h3>
          <ResponsiveContainer width="30%" height={250}>
            <BarChart data={financialData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis hide />
              <RechartsTooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {financialData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Room Management Section */}
      <div className="room-management-section">
        <div className="room-management-header">
          <h3 className="section-title">Room Occupancy Grid</h3>
          <div className="filter-group">
            <label>Filter Floor:</label>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="floor-select"
            >
              <option value="All">All Floors</option>
              {floors.map(f => (
                <option key={f} value={String(f)}>Floor {f}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="type-columns-container">
          {Object.keys(roomsByType).map(type => (
            <div key={type} className="type-column">
              <h4 className="type-title">{type}</h4>
              <div className="rooms-flex-grid">
                {roomsByType[type].map((room: any, idx: number) => (
                  <div key={`${room.room_no}-${idx}`}>
                    {renderRoomCircle(room)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Details Footer */}
      <div className="financial-footer">
        <div className="footer-stat">
          <span>Income Today:</span>
          <strong>₹{(finance.paid_today + finance.deposit_amount_today).toLocaleString()}</strong>
        </div>
        <div className="footer-stat">
          <span>Expenses:</span>
          <strong style={{ color: '#ef4444' }}>₹{finance.today_expenses.toLocaleString()}</strong>
        </div>
      </div>

      {/* Occupant Details Modal */}
      {isOccupantModalOpen && (
        <div className="dashboard-modal-overlay">
          <div className="dashboard-modal occupant-details-modal">
            <div className="modal-header">
              <h3>Room Occupants</h3>
              <button className="close-btn" onClick={() => setIsOccupantModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              {loadingOccupants ? (
                <p>Loading occupants...</p>
              ) : occupants.length === 0 ? (
                <p>No active occupants in this room.</p>
              ) : (
                <div className="occupants-list">
                  {occupants.map((occ, i) => (
                    <div key={i} className="occupant-detail-card">
                      <div className="occ-header">
                        <h4>{occ.name || occ.occupant_name}</h4>
                        <span className={`status-badge ${occ.payment_status ==1 ? 'paid' :'unpaid'}`}>
                          {occ.payment_status== 1 ? 'Paid' : 'Not Paid' }
                        </span>
                      </div>
                      <div className="occ-info-grid">
                        <div className="info-item">
                          <span>Check-in:</span>{" "}
                          {occ.checkInDate || occ.check_in_date
                            ? new Date(occ.checkInDate || occ.check_in_date).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                            : "-"}
                        </div>
                        <div className="info-item"><span>Bed No:</span> {occ.bed_no || occ.bed_id}</div>
                        <div className="info-item"><span>Rent:</span> ₹{occ.rent_amount || occ.total_amount}</div>
                        <div className="info-item"><span>Deposit:</span> ₹{occ.deposit_amount || occ.depositAmt}</div>
                        <div className="info-item"><span>Category:</span> {occ.room_type || occ.room_category || 'N/A'}</div>
                      </div>
                      <div className="occ-actions">
                        <button className="pay-btn" onClick={() => openPaymentModal(occ)} disabled={occ.payment_status == 1}>Pay Amount</button>
                        <button className="checkout-btn" onClick={() => handleCheckoutNav(occ)}>Check-out</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="dashboard-modal-overlay">
          <div className="dashboard-modal payment-modal">
            <div className="modal-header">
              <h3>Record Monthly Payment</h3>
              <button className="close-btn" onClick={() => setIsPaymentModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="payment-form">
                <div className="form-group">
                  <label>Occupant</label>
                  <input type="text" value={selectedOccupant?.name || selectedOccupant?.occupant_name} disabled />
                </div>
                <div className="form-group">
                  <label>Monthly Amount</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="form-group">
                  <label>Payment Mode</label>
                  <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK TRANSFER">Bank Transfer</option>
                  </select>
                </div>
                <button
                  className="submit-payment-btn"
                  onClick={handleProcessPayment}
                  disabled={processingPayment}
                >
                  {processingPayment ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;