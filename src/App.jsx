import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import GuestOnly from './components/GuestOnly'
import Home from './pages/Home'
import Login from './pages/Login'
import Maths from './pages/Maths'
import PoemReader from './pages/PoemReader'
import Poems from './pages/Poems'
import Register from './pages/Register'
import Science from './pages/Science'
import ScienceTopic from './pages/ScienceTopic'

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/poems" element={<Poems />} />
          <Route path="/poems/:id" element={<PoemReader />} />
          <Route path="/maths" element={<Maths />} />
          <Route path="/science" element={<Science />} />
          <Route path="/science/:id" element={<ScienceTopic />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
