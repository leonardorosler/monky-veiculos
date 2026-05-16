import { NavBar } from '../../components/NavBar/NavBar'
import { Hero } from '../../components/Hero/Hero'
import { Footer } from '../../components/Footer/Footer'
import { Destaques } from '../../components/Destaques/Destaques'
import { MarcasCarrossel } from '../../components/MarcasCarrossel/Marcascarrossel'

import { useNavigate } from 'react-router-dom'

import styles from './Home.module.css'

export function Home() {
  const navigate = useNavigate()
  
  return (
    <main className={styles.container}>
      <NavBar />
      <Hero />
      <MarcasCarrossel
        marcaSelecionada=""
        onSelecionarMarca={(nome) => navigate(`/catalogo?marca=${encodeURIComponent(nome)}`)}
      />
      <Destaques />
      <Footer />
    </main>
  )
}
