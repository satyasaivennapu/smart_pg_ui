import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/Reports.css';
import TransactionTable from './TransactionTable';
import { getTransactions } from '../services/authService';

const BookingTransactions: React.FC = () => {
  const navigate = useNavigate();

  const getToday = () => new Date().toISOString().split('T')[0];
  const getFirstDayOfMonth = () => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  };

  const [fromDate, setFromDate] = useState<string>(getFirstDayOfMonth());
  const [toDate, setToDate] = useState<string>(getToday());
  const [name, setName] = useState<string>('');
  const [roomNo, setRoomNo] = useState<string>('');
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // User wants explicit search trigger
  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return;

    const user = JSON.parse(savedUser);
    setLoading(true);

    const res = await getTransactions({
      tenantId: user.tenant_id,
      branchId: user.branch_id,
      fromDate,
      toDate,
      name,
      roomNo
    });

    if (res?.success) {
      const mappedData = (res.result || []).map((item: any) => ({
        id: item.invoice_number || item.booking_unique_id || 'N/A',
        bookingUniqueId: item.booking_unique_id || 'N/A',
        name: item.name || item.occupant_name || 'N/A',
        checkInDate: item.checkInDate || item.check_in_date || 'N/A',
        checkOutDate: item.checkOutDate || item.check_out_date || 'N/A',
        room: item.room || item.room_no || 'N/A',
        floor: item.floor || item.floor_no || 'N/A',
        depositAmt: Number(item.depositAmt || item.deposit_amount || 0),
        refundAmt: Number(item.refundAmt || item.refund_amount || 0),
        rentAmt: Number(item.rent_amount || item.rent_amount || 0),
        bedNo: Number(item.bed_no || item.bed_no || 0),
        totalAmt: Number(item.totalAmt || item.total_amount || item.monthly_amount || 0)
      }));
      setReportData(mappedData);
    }
    setLoading(false);
  };

  const handleClear = () => {
    const today = getToday();
    setFromDate(today);
    setToDate(today);
    setName('');
    setRoomNo('');
    // Optionally trigger a search with reset values
    // fetchReport(); 
  };

  return (
    <div className="reports-layout-container">
      {/* Top Header */}
      <div className="reports-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          &#8249;
        </button>
        <h2 className="reports-title">Booking Transactions</h2>
      </div>

      <div className="filter-row">
        <div className="filter-item">
          <label>From Date</label>
          <div className="filter-input-wrapper">
             <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} onClick={(e) => (e.target as any).showPicker?.()} />
          </div>
        </div>

        <div className="filter-item">
          <label>To Date</label>
          <div className="filter-input-wrapper">
             <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} onClick={(e) => (e.target as any).showPicker?.()} />
          </div>
        </div>

        <div className="filter-item">
          <label>Search Name</label>
          <div className="filter-input-wrapper">
             <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>

        <div className="filter-item">
          <label>Room No</label>
          <div className="filter-input-wrapper">
             <input type="text" placeholder="Room" value={roomNo} onChange={(e) => setRoomNo(e.target.value)} />
          </div>
        </div>

        <button className="search-btn-compact" onClick={fetchReport} disabled={loading}>
          {loading ? '...' : 'Search'}
        </button>
        <button className="clear-btn-compact" onClick={handleClear} disabled={loading}>
          Clear
        </button>
      </div>

      <div className="report-list">
        {loading ? <p style={{textAlign:'center', padding:'20px'}}>Loading...</p> : <TransactionTable data={reportData} />}
      </div>
    </div>
  );
};

export default BookingTransactions;