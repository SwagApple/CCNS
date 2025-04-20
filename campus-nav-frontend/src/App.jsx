import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import MapPage from './components/MapPage'
import RegisterPage from './pages/RegisterPage'



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/account" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/map" element={<MapPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
