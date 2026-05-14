import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PrivateRoute } from './components/PrivateRoute'
import { Home } from './pages/Home/Home'
import { Catalogo } from './pages/Catalogo/Catalogo'
import { Veiculo } from './pages/Veiculo/Veiculo'
import { Favoritos } from './pages/Favoritos/Favoritos'
import { Login } from './pages/admin/Login/Login'
import { Dashboard } from './pages/admin/Dashboard/Dashboard'
import { Estoque } from './pages/admin/Estoque/Estoque'
import { FormVeiculo } from './pages/admin/FormVeiculo/FormVeiculo'
import { VenderCarro } from './pages/VenderCarro/VenderCarro'
import { Financiamento } from './pages/Financiamento/Financiamento'
import { Leads } from './pages/admin/Leads/Leads'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Público */}
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/veiculo/:id" element={<Veiculo />} />
          <Route path="/favoritos" element={<Favoritos />} />
          <Route path="/vender-meu-carro" element={<VenderCarro />} />
          <Route path="/financiamento" element={<Financiamento />} />

          {/* Admin */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/admin/estoque" element={<PrivateRoute><Estoque /></PrivateRoute>} />
          <Route path="/admin/veiculos/novo" element={<PrivateRoute><FormVeiculo /></PrivateRoute>} />
          <Route path="/admin/veiculos/:id/editar" element={<PrivateRoute><FormVeiculo /></PrivateRoute>} />
          <Route path="/admin/leads" element={<PrivateRoute><Leads /></PrivateRoute>} />

       </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}