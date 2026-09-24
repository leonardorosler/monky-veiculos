import { useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Bike, Car, Gauge, Search, ShieldCheck, SlidersHorizontal, Truck, Users } from 'lucide-react'
import { siteConfig } from '../../config/site'

import styles from './Hero.module.css'

const metricIcons = [Gauge, Users, ShieldCheck]

export function Hero() {
  const navigate = useNavigate()
  const [filtros, setFiltros] = useState({
    marca: '',
    modelo: '',
    preco_max: '',
    ano: '',
    combustivel: '',
  })

  function handleBuscar(e: React.FormEvent) {
    e.preventDefault()

    const params = new URLSearchParams()
    Object.entries(filtros).forEach(([chave, valor]) => {
      if (valor) params.set(chave, valor)
    })

    const query = params.toString()
    navigate(query ? `/catalogo?${query}` : '/catalogo')
  }

  return (
    <section className={styles.hero} style={{ '--hero-image': `url("${siteConfig.assets.hero}")` } as CSSProperties}>
      <div className={styles.overlay} />

      <div className={styles.heroConteudo}>
        <div className={styles.copy}>
          <span className={styles.badge}>{siteConfig.home.hero.badge}</span>

          <h1 className={styles.heroTitulo}>
            {siteConfig.home.hero.titleBefore} <span>{siteConfig.home.hero.titleHighlight}</span> {siteConfig.home.hero.titleAfter}
          </h1>

          <p className={styles.heroSubtitulo}>{siteConfig.home.hero.description}</p>

          <div className={styles.acoes}>
            <button onClick={() => navigate('/catalogo')} className={styles.heroBotao}>
              {siteConfig.home.hero.primaryAction}
              <ArrowRight size={18} />
            </button>

            <button onClick={() => navigate('/vender-meu-carro')} className={styles.heroBotaoSecundario}>
              {siteConfig.home.hero.secondaryAction}
            </button>
          </div>

          <div className={styles.metricas}>
            {siteConfig.home.hero.metrics.map((metric, index) => {
              const Icon = metricIcons[index]
              return (
                <div key={metric.title}>
                  <Icon size={28} />
                  <strong>{metric.title}</strong>
                  <span>{metric.description}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* <div className={styles.selo}>
          <BadgeCheck size={22} />
          <strong>Qualidade</strong>
          <span>que te leva mais longe.</span>
        </div> */}
      </div>

      <form className={styles.busca} onSubmit={handleBuscar}>
        <div className={styles.buscaTopo}>
          <div className={styles.abas}>
            <button type="button" className={styles.abaAtiva}>
              <Car size={18} />
              Todos os veículos
            </button>
            <button type="button" onClick={() => navigate('/catalogo')}>
              <Car size={18} />
              Carros
            </button>
            <button type="button" onClick={() => navigate('/catalogo')}>
              <Bike size={18} />
              Motos
            </button>
            <button type="button" onClick={() => navigate('/catalogo')}>
              <Truck size={18} />
              Utilitários
            </button>
          </div>
          <button type="button" className={styles.buscaAvancada} onClick={() => navigate('/catalogo')}>
            Busca avançada
            <SlidersHorizontal size={16} />
          </button>
        </div>

        <div className={styles.campos}>
          <label>
            <span>Marca</span>
            <select value={filtros.marca} onChange={(e) => setFiltros((prev) => ({ ...prev, marca: e.target.value }))}>
              <option value="">Todas</option>
              {siteConfig.catalog.brands.map((marca) => (
                <option key={marca.nome} value={marca.nome}>
                  {marca.nome}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Modelo</span>
            <input
              value={filtros.modelo}
              onChange={(e) => setFiltros((prev) => ({ ...prev, modelo: e.target.value }))}
              placeholder="Ex: Corolla"
            />
          </label>

          <label>
            <span>Faixa de preço</span>
            <select value={filtros.preco_max} onChange={(e) => setFiltros((prev) => ({ ...prev, preco_max: e.target.value }))}>
              {siteConfig.catalog.heroPriceRanges.map((faixa) => (
                <option key={faixa.label} value={faixa.value}>
                  {faixa.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Ano</span>
            <select value={filtros.ano} onChange={(e) => setFiltros((prev) => ({ ...prev, ano: e.target.value }))}>
              <option value="">Qualquer ano</option>
              {siteConfig.catalog.years.map((year) => <option key={year} value={year}>{year} ou mais novo</option>)}
            </select>
          </label>

          <label>
            <span>Combustível</span>
            <select value={filtros.combustivel} onChange={(e) => setFiltros((prev) => ({ ...prev, combustivel: e.target.value }))}>
              <option value="">Todos</option>
              {siteConfig.catalog.fuels.map((combustivel) => (
                <option key={combustivel.label} value={combustivel.value}>
                  {combustivel.label}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className={styles.botaoBusca}>
            <Search size={18} />
            Buscar
          </button>
        </div>
      </form>
    </section>
  )
}
