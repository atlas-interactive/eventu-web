import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { FormularioLogin } from './features/auth/FormularioLogin';
import { FormularioRegistro } from './features/auth/FormularioRegistro';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen items-center justify-center bg-eventu-page-background p-2.5">
        <Routes>
          <Route path="/login" element={<FormularioLogin />} />
          <Route path="/registro" element={<FormularioRegistro />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;