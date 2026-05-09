import { FC } from 'react';
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom';
import './Reports.css';

// We define the type for outlet context
export type ReportsOutletContext = {};

const ReportsLayout: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();



  return (
    <div className="reports-layout-container">
      {/* Top Header */}
      <div className="reports-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          &#8249;
        </button>
        <h2 className="reports-title">Reports</h2>
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
        {/* Child components will handle their own filters */}
        <Outlet context={{ } satisfies ReportsOutletContext} />
      </div>
    </div>
  );
};

export default ReportsLayout;
