import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaUsers, FaUserTie, FaUserShield, FaCalendarAlt, FaUserPlus } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">
        <h2>LEONI Admin</h2>
      </div>
      <nav>
        <NavLink to="/suppliers" className="nav-link">
          <FaUsers /> Suppliers
        </NavLink>
        <NavLink to="/personnel" className="nav-link">
          <FaUserTie /> Leoni Personnel
        </NavLink>
        <NavLink to="/sos" className="nav-link">
          <FaUserShield /> SOS Accounts
        </NavLink>
        <NavLink to="/schedule" className="nav-link">
          <FaCalendarAlt /> Schedule Presence
        </NavLink>
        <NavLink to="/signup-requests" className="nav-link">
          <FaUserPlus /> Sign-Up Requests
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;