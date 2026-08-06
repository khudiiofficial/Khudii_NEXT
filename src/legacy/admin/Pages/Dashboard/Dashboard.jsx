import React from 'react';
import Sidebar from '../../components/navbar/Navbar';

const Dashboard = ({ children }) => (
  <div className="flex h-screen">
    <Sidebar />
    <div className="flex-1 overflow-auto">{children}</div>
  </div>
);

export default Dashboard;
