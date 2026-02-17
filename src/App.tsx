import './App.css'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate
} from 'react-router-dom';
import { useState } from 'react';

import SideNav from './components/SideNav';
import Login from './components/Login';

// Pages
import Dashboard from './components/Dashboard';
import Checkin from './components/Checkin';
import CheckOuts from './components/CheckOuts';
import BookingTransactions from './components/BookingTransactions';
import Expenses from './components/Expenses';
import Income from './components/Income';

// Masters
import Tenants from './components/Tenants';
import Branches from './components/Branches';
import Users from './components/Users';
import Rooms from './components/Rooms';
import RoomTypes from './components/RoomTypes';

// Reports
import CheckinReport from './components/CheckinReport';
import CheckOutReport from './components/CheckOutReport';
import TransactionReport from './components/TransactionReport';
import ExpensesReport from './components/ExpensesReport';
import IncomeReports from './components/IncomeReports';

/* -----------------------------
   Auth Helper
--------------------------------*/
const isAuthenticated = () => {
  return !!localStorage.getItem("username");   // you can replace with token
};

/* -----------------------------
   Private Layout
--------------------------------*/
function PrivateLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div className={`app-layout ${sidebarOpen ? "" : "sidebar-closed"}`}>

      {/* Header */}
      <header className="header">

        {/* Left */}
        <div className="header-left">
          <button
            className="menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h3>Smart PG</h3>
        </div>

        {/* Right */}
        <div className="header-right">
          <span className="logout-btn" onClick={handleLogout}>
            Logout
          </span>
          <span className="username">{username}</span>
        </div>

      </header>

      {/* Sidebar */}
      <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Page Content */}
      <div className="content">
        <Outlet />
      </div>

    </div>
  );
}

/* -----------------------------
   Route Guard
--------------------------------*/
function PrivateRoute() {
  return isAuthenticated() ? <PrivateLayout /> : <Navigate to="/login" replace />;
}

/* -----------------------------
   App Router
--------------------------------*/
function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ✅ Public Route */}
        <Route path="/login" element={<Login />} />

        {/* ✅ Protected Routes */}
        <Route element={<PrivateRoute />}>

          <Route path="/" element={<Navigate to="/login" />} />

          {/* Main Pages */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/checkin" element={<Checkin />} />
          <Route path="/checkouts" element={<CheckOuts />} />
          <Route path="/booking-transactions" element={<BookingTransactions />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/income" element={<Income />} />

          {/* Masters */}
          <Route path="/masters/tenants" element={<Tenants />} />
          <Route path="/masters/branches" element={<Branches />} />
          <Route path="/masters/users" element={<Users />} />
          <Route path="/masters/rooms" element={<Rooms />} />
          <Route path="/masters/room-types" element={<RoomTypes />} />

          {/* Reports */}
          <Route path="/reports/checkin" element={<CheckinReport />} />
          <Route path="/reports/checkout" element={<CheckOutReport />} />
          <Route path="/reports/transactions" element={<TransactionReport />} />
          <Route path="/reports/expenses" element={<ExpensesReport />} />
          <Route path="/reports/income" element={<IncomeReports />} />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;

