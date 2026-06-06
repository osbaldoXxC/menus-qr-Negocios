import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Register/Landing/Landing';
import { Register } from './pages/Register/Register';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/discovery" element={<div>Discovery Feed - Próximamente</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;