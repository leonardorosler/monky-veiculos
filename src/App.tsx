import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PlanoProvider } from './contexts/PlanoContext'
import { PrivateRoute } from './components/PrivateRoute'
import { PlanFeatureRoute } from './components/PlanFeatureRoute'
import { PublicLayout } from './components/PublicLayout'
import { Home } from './pages/Home/Home'
import { Catalogo } from './pages/Catalogo/Catalogo'
import { Veiculo } from './pages/Veiculo/Veiculo'
import { Favoritos } from './pages/Favoritos/Favoritos'
import { VenderCarro } from './pages/VenderCarro/VenderCarro'
import { Financiamento } from './pages/Financiamento/Financiamento'
import { Login } from './pages/admin/Login/Login'
import { Dashboard } from './pages/admin/Dashboard/Dashboard'
import { Estoque } from './pages/admin/Estoque/Estoque'
import { FormVeiculo } from './pages/admin/FormVeiculo/FormVeiculo'
import { Leads } from './pages/admin/Leads/Leads'
import { Usuarios } from './pages/admin/Usuarios/Usuarios'
import { SiteProvider } from './contexts/SiteContext'
import { Relatorios } from './pages/admin/Comercial/Relatorios'
import { Alertas } from './pages/admin/Comercial/Alertas'
import { Configuracao } from './pages/admin/Comercial/Configuracao'

export default function App() {
  return (
    <AuthProvider>
      <PlanoProvider>
        <SiteProvider>
        <BrowserRouter>
          <Routes>
            {/* Público */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/catalogo" element={<Catalogo />} />
              <Route path="/veiculo/:id" element={<Veiculo />} />
              <Route path="/favoritos" element={<Favoritos />} />
              <Route path="/vender-meu-carro" element={
                <PlanFeatureRoute recurso="LEADS"><VenderCarro /></PlanFeatureRoute>
              } />
              <Route path="/financiamento" element={
                <PlanFeatureRoute recurso="LEADS"><Financiamento /></PlanFeatureRoute>
              } />
              <Route path="*" element={
                <main style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                  <h1>Página não encontrada</h1>
                  <p>O endereço pode ter mudado.</p>
                  <Link className="ui-button" to="/catalogo">Ver catálogo</Link>
                </main>
              } />
            </Route>

            {/* Administração da revenda */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/admin/estoque" element={<PrivateRoute><Estoque /></PrivateRoute>} />
            <Route path="/admin/veiculos/novo" element={<PrivateRoute adminOnly><FormVeiculo /></PrivateRoute>} />
            <Route path="/admin/veiculos/:id/editar" element={<PrivateRoute adminOnly><FormVeiculo /></PrivateRoute>} />
            <Route path="/admin/leads" element={
              <PrivateRoute><PlanFeatureRoute recurso="LEADS"><Leads /></PlanFeatureRoute></PrivateRoute>
            } />
            <Route path="/admin/usuarios" element={<PrivateRoute adminOnly><Usuarios /></PrivateRoute>} />
            <Route path="/admin/relatorios" element={<PrivateRoute><PlanFeatureRoute recurso="RELATORIOS_CONVERSAO"><Relatorios /></PlanFeatureRoute></PrivateRoute>} />
            <Route path="/admin/alertas" element={<PrivateRoute><PlanFeatureRoute recurso="AUTOMACOES_COMERCIAIS"><Alertas /></PlanFeatureRoute></PrivateRoute>} />
            <Route path="/admin/configuracao" element={<PrivateRoute adminOnly><PlanFeatureRoute recurso="PERSONALIZACAO_AVANCADA"><Configuracao /></PlanFeatureRoute></PrivateRoute>} />
          </Routes>
        </BrowserRouter>
        </SiteProvider>
      </PlanoProvider>
    </AuthProvider>
  )
}
