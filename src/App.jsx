import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Maths from './pages/Maths'
import PoemReader from './pages/PoemReader'
import Poems from './pages/Poems'
import Science from './pages/Science'
import ScienceTopic from './pages/ScienceTopic'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/poems" element={<Poems />} />
        <Route path="/poems/:id" element={<PoemReader />} />
        <Route path="/maths" element={<Maths />} />
        <Route path="/science" element={<Science />} />
        <Route path="/science/:id" element={<ScienceTopic />} />
      </Route>
    </Routes>
  )
}
