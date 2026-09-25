import { Navigate, Route, Routes } from 'react-router-dom'
import ProfilePicker from './pages/ProfilePicker'
import Home from './pages/Home'
import LessonRunner from './pages/LessonRunner'
import LessonComplete from './pages/LessonComplete'
import { Curriculum } from './pages/Curriculum'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ProfilePicker />} />
      <Route path="/home" element={<Home />} />
      <Route path="/lesson" element={<LessonRunner />} />
      <Route path="/complete" element={<LessonComplete />} />
      <Route path="/curriculum" element={<Curriculum />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
