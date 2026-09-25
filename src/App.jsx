import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import ForkliftPage from './pages/ForkliftPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/targonca/:id" element={<ForkliftPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
