import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing/Landing';
import { Register } from './pages/Register/Register';
import { ComoFunciona } from './pages/ComoFunciona/ComoFunciona';
import { ParaRestaurantes } from './pages/ParaRestaurantes/ParaRestaurantes';
import { Precios } from './pages/Precios/Precios';
import { Descubrir } from './pages/Descubrir/Descubrir';
import { EscanearQR } from './pages/EscanearQR/EscanearQR';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/como-funciona" element={<ComoFunciona />} />
        <Route path="/para-restaurantes" element={<ParaRestaurantes />} />
        <Route path="/precios" element={<Precios />} />
        <Route path="/descubrir" element={<Descubrir />} />
        <Route path="/escanear" element={<EscanearQR />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;