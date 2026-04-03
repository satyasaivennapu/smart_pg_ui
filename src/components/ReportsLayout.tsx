import React, { useState } from 'react';
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom';
import './Reports.css';

// We define the type for outlet context
export type ReportsOutletContext = {
  fromDate: string;
  toDate: string;
};

const ReportsLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get current date formatted as YYYY-MM-DD
  const getToday = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getFirstDayOfMonth = () => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split('T')[0];
  };

  const [fromDate, setFromDate] = useState<string>(getFirstDayOfMonth());
  const [toDate, setToDate] = useState<string>(getToday());

  return (
    <div className="reports-layout-container">
      {/* Top Header */}
      <div className="reports-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          &#8249;
        </button>
        <h2 className="reports-title">Reports</h2>
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

      {/* Tabs */}
      <div className="reports-tabs">
        <NavLink 
          to="/reports/checkin" 
          className={({ isActive }) => `report-tab ${isActive || location.pathname === '/reports' ? 'active' : ''}`}
        >
          CheckIn Report
        </NavLink>
        <NavLink 
          to="/reports/checkout" 
          className={({ isActive }) => `report-tab ${isActive ? 'active' : ''}`}
        >
          CheckOut Report
        </NavLink>
      </div>

      {/* Content Area Rendering specific Report lists (Checkin/Checkout) */}
      <div className="reports-content-area">
        {/* Pass down the date state to the child components */}
        <Outlet context={{ fromDate, toDate } satisfies ReportsOutletContext} />
      </div>
    </div>
  );
};

export default ReportsLayout;
