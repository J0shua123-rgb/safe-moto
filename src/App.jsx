import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PassengerHome from './pages/PassengerHome'
import Register from './pages/Register'
import RiderDashboard from './pages/RiderDashboard'
import RiderProfile from './pages/RiderProfile'
import AdminPanel from './pages/AdminPanel'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PassengerHome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/rider/dashboard" element={<RiderDashboard />} />
        <Route path="/rider/:id" element={<RiderProfile />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
