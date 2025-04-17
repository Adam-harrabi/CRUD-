import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import SupplierList from './components/SupplierList';
import LeoniPersonnel from './components/LeoniPersonnel';
import SOSAccounts from './components/SOSAccounts';
import SchedulePresence from './components/SchedulePresence';
import './App.css';

function App() {
  // Initialize state for all data
  const [suppliers, setSuppliers] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [sosAccounts, setSosAccounts] = useState([]);
  const [schedules, setSchedules] = useState([]);

  // Load all data from localStorage on initial mount
  useEffect(() => {
    const savedSuppliers = localStorage.getItem('suppliers');
    const savedPersonnel = localStorage.getItem('personnel');
    const savedSosAccounts = localStorage.getItem('sosAccounts');
    const savedSchedules = localStorage.getItem('schedules');

    if (savedSuppliers) setSuppliers(JSON.parse(savedSuppliers));
    if (savedPersonnel) setPersonnel(JSON.parse(savedPersonnel));
    if (savedSosAccounts) setSosAccounts(JSON.parse(savedSosAccounts));
    if (savedSchedules) setSchedules(JSON.parse(savedSchedules));
  }, []);

  // Save all data to localStorage whenever it changes
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

  return (
    <Router>
      <div className="app">
        <Sidebar />
        <Routes>
          <Route 
            path="/suppliers" 
            element={
              <SupplierList 
                suppliers={suppliers} 
                setSuppliers={setSuppliers} 
              />
            } 
          />
          <Route 
            path="/personnel" 
            element={
              <LeoniPersonnel 
                personnel={personnel} 
                setPersonnel={setPersonnel} 
              />
            } 
          />
          <Route 
            path="/sos" 
            element={
              <SOSAccounts 
                accounts={sosAccounts} 
                setAccounts={setSosAccounts} 
              />
            } 
          />
          <Route 
            path="/schedule" 
            element={
              <SchedulePresence 
                schedules={schedules} 
                setSchedules={setSchedules} 
              />
            } 
          />
          <Route path="/" element={<div className="content">Welcome to Admin Dashboard</div>} />
          }
        </Routes>
      </div>
    </Router>
  );
}

export default App;