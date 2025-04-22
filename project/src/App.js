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

function App() {
  const [suppliers, setSuppliers] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [sosAccounts, setSosAccounts] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(auth === 'true');

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

  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? (
      <>
        <Sidebar />
        {children}
      </>
    ) : (
      <Navigate to="/signin" />
    );
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/suppliers"
            element={
              <PrivateRoute>
                <SupplierList suppliers={suppliers} setSuppliers={setSuppliers} />
              </PrivateRoute>
            }
          />
          <Route
            path="/personnel"
            element={
              <PrivateRoute>
                <LeoniPersonnel personnel={personnel} setPersonnel={setPersonnel} />
              </PrivateRoute>
            }
          />
          <Route
            path="/sos"
            element={
              <PrivateRoute>
                <SOSAccounts accounts={sosAccounts} setAccounts={setSosAccounts} />
              </PrivateRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <PrivateRoute>
                <SchedulePresence schedules={schedules} setSchedules={setSchedules} />
              </PrivateRoute>
            }
          />
          <Route
            path="/signup-requests"
            element={
              <PrivateRoute>
                <SignUpRequests />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/signin" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;