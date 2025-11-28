import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Projects from './pages/Projects'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Projects />} />
          <Route path="project/:projectId/*" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
