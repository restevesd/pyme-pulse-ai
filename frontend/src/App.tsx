import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Analyze from "./pages/Analyze"

export default function App() {
  return (
    <div className="min-h-dvh flex flex-col">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  )
}
