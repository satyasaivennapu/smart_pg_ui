import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/Reports.css';
import TransactionTable from './TransactionTable';
import { checkInTransactions } from './CheckinReport';

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

  // Use only checkin transactions as requested
  const filteredData = checkInTransactions.filter(txn => {
    if (!fromDate || !toDate) return true;
    return txn.checkInDate >= fromDate && txn.checkInDate <= toDate;
  });

  return (
    <div className="reports-layout-container">
      {/* Top Header */}
      <div className="reports-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          &#8249;
        </button>
        <h2 className="reports-title">Booking Transactions</h2>
      </div>

      {/* Global Date Filters */}
      <div className="reports-filters">
        <div className="date-input-wrapper">
          <input
            type="date"
            className="reports-date-picker"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="date-input-wrapper">
          <input
            type="date"
            className="reports-date-picker"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      <div className="report-list">
        <TransactionTable data={filteredData} />
      </div>
    </div>
  );
};

export default BookingTransactions;