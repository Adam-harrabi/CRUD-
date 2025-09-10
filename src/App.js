import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import SupplierList from './components/SupplierList';
import LeoniPersonnel from './components/LeoniPersonnel';
import SOSAccounts from './components/SOSAccounts';
import SchedulePresence from './components/SchedulePresence';
import SignUpRequests from './components/SignUpRequests/SignUpRequests';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import './App.css';
import SOSSupplierList from './SOS/SOSSupplierList';
import SOSLeoniPersonnel from './SOS/SOSLeoniPersonnel';
import LogsTable from './components/LogsTable';
import Profile from './components/Profile';
import UserDropdown from './components/UserDropdown';
import Password from './components/Password';
import ProvideAccess from './SOS/ProvideAccess';
import Incidents from './SOS/Incidents';
import Dashboard from './components/Dashboard';
import ConsultReports from './components/ConsultReports';

function App() {
  const [suppliers, setSuppliers] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [sosAccounts, setSosAccounts] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSOSAuthenticated, setIsSOSAuthenticated] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    const sosAuth = localStorage.getItem('isSOSAuthenticated');
    setIsAuthenticated(auth === 'true');
    setIsSOSAuthenticated(sosAuth === 'true');

    const savedSuppliers = localStorage.getItem('suppliers');
    const savedPersonnel = localStorage.getItem('personnel');
    const savedSosAccounts = localStorage.getItem('sosAccounts');
    const savedSchedules = localStorage.getItem('schedules');

    if (savedSuppliers) setSuppliers(JSON.parse(savedSuppliers));
    if (savedPersonnel) setPersonnel(JSON.parse(savedPersonnel));
    if (savedSosAccounts) setSosAccounts(JSON.parse(savedSosAccounts));
    if (savedSchedules) setSchedules(JSON.parse(savedSchedules));
  }, []);

  useEffect(() => {
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('personnel', JSON.stringify(personnel));
  }, [personnel]);

  useEffect(() => {
    localStorage.setItem('sosAccounts', JSON.stringify(sosAccounts));
  }, [sosAccounts]);

  useEffect(() => {
    localStorage.setItem('schedules', JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    
  }, [isAuthenticated, isSOSAuthenticated]);

 const PrivateRoute = ({ children, allowedRole }) => {
  const userRole = localStorage.getItem('userRole');
  const token = localStorage.getItem('token'); // Check for token instead
  const isAuth = !!token; // Convert to boolean - true if token exists
  
  const isAllowed = !allowedRole || userRole === allowedRole;

  if (!isAuth) {
    return <Navigate to="/signin" />;
  }

  if (!isAllowed) {
    return <Navigate to={userRole === 'sos' ? '/sos/suppliers' : '/suppliers'} />;
  }

  return children;
};


  return (
    <Router>
      <UserDropdown />
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <div className="app">
                <Sidebar />
                <Dashboard />
              </div>
            </PrivateRoute>
          }
        />
        {/* All other routes: sidebar outside, no .app/.content wrapper */}
        <Route
          path="/suppliers"
          element={
            <PrivateRoute allowedRole="admin">
              <Sidebar />
              <SupplierList suppliers={suppliers} setSuppliers={setSuppliers} />
            </PrivateRoute>
          }
        />
        <Route
          path="/personnel"
          element={
            <PrivateRoute allowedRole="admin">
              <Sidebar />
              <LeoniPersonnel personnel={personnel} setPersonnel={setPersonnel} />
            </PrivateRoute>
          }
        />
        <Route
          path="/sos/suppliers"
          element={
            <PrivateRoute allowedRole="sos">
              <Sidebar />
              <SOSSupplierList suppliers={suppliers} setSuppliers={setSuppliers} />
            </PrivateRoute>
          }
        />
        <Route
          path="/sos/personnel"
          element={
            <PrivateRoute allowedRole="sos">
              <Sidebar />
              <SOSLeoniPersonnel personnel={personnel} setPersonnel={setPersonnel} />
            </PrivateRoute>
          }
        />
        <Route
          path="/sos"
          element={
            <PrivateRoute allowedRole="admin">
              <Sidebar />
              <SOSAccounts accounts={sosAccounts} setAccounts={setSosAccounts} />
            </PrivateRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <PrivateRoute allowedRole="admin">
              <Sidebar />
              <SchedulePresence schedules={schedules} setSchedules={setSchedules} />
            </PrivateRoute>
          }
        />
        <Route
          path="/signup-requests"
          element={
            <PrivateRoute allowedRole="admin">
              <Sidebar />
              <SignUpRequests />
            </PrivateRoute>
          }
        />
        <Route
          path="/sos/logs"
          element={
            <PrivateRoute allowedRole="sos">
              <Sidebar />
              <LogsTable />
            </PrivateRoute>
          }
        />
        <Route
          path="/logs"
          element={
            <PrivateRoute allowedRole="admin">
              <Sidebar />
              <LogsTable />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Sidebar />
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/password"
          element={
            <PrivateRoute>
              <Sidebar />
              <Password />
            </PrivateRoute>
          }
        />
        <Route
          path="/provide-access"
          element={
            <PrivateRoute allowedRole="sos">
              <Sidebar />
              <ProvideAccess />
            </PrivateRoute>
          }
        />
        <Route
          path="/sos/incidents"
          element={
            <PrivateRoute allowedRole="sos">
              <Sidebar />
              <Incidents />
            </PrivateRoute>
          }
        />
        <Route
          path="/consult-reports"
          element={
            <PrivateRoute allowedRole="admin">
              <Sidebar />
              <ConsultReports />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/signin" />} />
      </Routes>
    </Router>
  );
}

export default App;