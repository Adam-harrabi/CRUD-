import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaUsers, FaUserTie, FaUserShield, FaCalendarAlt, FaUserPlus, FaExclamationTriangle, FaChartBar } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const userRole = localStorage.getItem('userRole');

  return (
    <div className="sidebar">
      <div className="logo">
        <h2>{userRole === 'sos' ? 'LEONI SOS' : 'LEONI Admin'}</h2>
      </div>
      <nav>
        {/* Only show Suppliers and Leoni Personnel for Admin users */}
        {userRole !== 'sos' && (
          <>
            <NavLink to="/suppliers" className="nav-link">
              <FaUsers /> Suppliers
            </NavLink>
            <NavLink to="/personnel" className="nav-link">
              <FaUserTie /> Leoni Personnel
            </NavLink>
          </>
        )}
        
        {userRole === 'sos' && (
          <>
            <NavLink to="/sos/logs" className="nav-link">
              <FaCalendarAlt /> Entry & Exit Logs
            </NavLink>
            <NavLink to="/provide-access" className="nav-link">
              <FaUserShield /> Provide Access
            </NavLink>
            <NavLink to="/sos/incidents" className="nav-link">
              <FaExclamationTriangle /> Report Incident/Bug
            </NavLink>
          </>
        )}
        
        {userRole !== 'sos' && (
          <>
            <NavLink to="/sos" className="nav-link">
              <FaUserShield /> SOS Accounts
            </NavLink>
            <NavLink to="/schedule" className="nav-link">
              <FaCalendarAlt /> Schedule Presence
            </NavLink>
            <NavLink to="/signup-requests" className="nav-link">
              <FaUserPlus /> Sign-Up Requests
            </NavLink>
            <NavLink to="/logs" className="nav-link">
              <FaCalendarAlt /> Entry & Exit Logs
            </NavLink>
            <NavLink to="/consult-reports" className="nav-link">
              <FaExclamationTriangle /> Consult Reports Incidents/Bugs
            </NavLink>
            <NavLink to="/dashboard" className="nav-link">
              <FaChartBar /> Dashboard
            </NavLink>
          </>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;