import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./SideNav.css";
type Props = {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
import logo from "../assets/images/logo.png";
function SideNav({ sidebarOpen, setSidebarOpen }: Props) {

  const navigate = useNavigate();
  const [mastersOpen, setMastersOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  // const [sidebarsOpen, setSidebarOpen] = useState(true);
  const isMobile = window.innerWidth <= 768;
  const handleMenuClick = (menuName: string) => {
    console.log("menu name", menuName);
    setMastersOpen(false);
    setReportsOpen(false);

    // ✅ Auto close sidebar only on mobile
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleMastersClick = () => {
    const isOpenMasters = !mastersOpen;
    setMastersOpen(isOpenMasters);
    setReportsOpen(false);
    if (isOpenMasters) {
      navigate("/masters/tenants");
    }
  };

  const handleReportsClick = () => {
    const isOpenReports = !reportsOpen;
    setMastersOpen(false);
    setReportsOpen(isOpenReports);
    if (isOpenReports) {
      navigate("/reports/checkin");
    }
  };
  return (
    <div className={`sidenav ${sidebarOpen ? "open" : "closed"}`}>
      <h2 className="logo" onClick={() => isMobile && setSidebarOpen(false)}>Smart PG</h2>
      {/* <img
        src={logo}
        alt="Smart PG"
        className="logo"
        onClick={() => isMobile && setSidebarOpen(false)}
      /> */}

      <NavLink to="/dashboard" className="nav-link" onClick={() => { handleMenuClick('Dashboard') }}>
        Dashboard
      </NavLink>

      <NavLink to="/checkin" className="nav-link" onClick={() => { handleMenuClick('Checkin') }}>
        Checkin
      </NavLink>

      <NavLink to="/checkouts" className="nav-link" onClick={() => { handleMenuClick('Checkouts') }}>
        Checkouts
      </NavLink>

      <NavLink to="/booking-transactions" className="nav-link" onClick={() => { handleMenuClick('Booking Transactions') }}>
        Booking Transactions
      </NavLink>

      <NavLink to="/income" className="nav-link" onClick={() => { handleMenuClick('Income') }}>
        Income
      </NavLink>

      <NavLink to="/expenses" className="nav-link" onClick={() => { handleMenuClick('Expenses') }}>
        Expenses
      </NavLink>

      {/* Masters */}
      <div className="menu-group" onClick={handleMastersClick}>
        Masters ▾
      </div>

      {mastersOpen && (
        <div className="submenu">
          <NavLink to="/masters/tenants" className="nav-link">
            Tenants
          </NavLink>
          <NavLink to="/masters/branches" className="nav-link">
            Branches
          </NavLink>
          <NavLink to="/masters/users" className="nav-link">
            Users
          </NavLink>
          <NavLink to="/masters/rooms" className="nav-link">
            Rooms
          </NavLink>
          <NavLink to="/masters/room-types" className="nav-link">
            Room Types
          </NavLink>
        </div>
      )}

      {/* Reports */}
      <div className="menu-group" onClick={handleReportsClick} >
        Reports ▾
      </div>

      {reportsOpen && (
        <div className="submenu">
          <NavLink to="/reports/checkin" className="nav-link">
            Checkin Report
          </NavLink>
          <NavLink to="/reports/checkout" className="nav-link">
            Checkout Report
          </NavLink>
          <NavLink to="/reports/transactions" className="nav-link">
            Transactions
          </NavLink>
          <NavLink to="/reports/expenses" className="nav-link">
            Expenses Report
          </NavLink>
          <NavLink to="/reports/income" className="nav-link">
            Income Report
          </NavLink>
        </div>
      )}
      <p className="sidebar-footer">
        © {new Date().getFullYear()} All rights reserved
      </p>
    </div>

  );
}

export default SideNav;
