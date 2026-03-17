import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnnouncementProvider } from './contexts/AnnouncementContext';
import ForgotPassword from './components/ForgotPassword';
import Members from './components/Members';
import LoginScreen from './components/LoginScreen';
import Gymequipment from './components/Gymequipment';
import Announcement from './components/Announcement';
//import Dashboard from './components/Dashboard';
import UserDashboard from './components/UserDashboard';
import Stafflist from './components/Stafflist';
import StaffEntry from './components/StaffEntry';
import Membershippurchase from './components/Membershippurchase';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AnnouncementProvider>
        <Routes>
          <Route path="/" element={<LoginScreen />} />
          <Route path="/forgot-password" element={<ForgotPassword />} /> 
          <Route path="/members" element={<Members />} />
          <Route path="/equipment" element={<Gymequipment />} />
          <Route path="/announcements" element={<Announcement />} />
        {/*<Route path="/dashboard" element={<Dashboard />} />*/}
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/staff-list" element={<Stafflist />} />
          <Route path="/staff-entry" element={<StaffEntry />} />
          <Route path="/membership-purchase" element={<Membershippurchase />} />
        </Routes>
      </AnnouncementProvider>
    </BrowserRouter>
  );
}

export default App;