import { NavBar } from '../../components/NavBar/NavBar'
import { Hero } from '../../components/Hero/Hero'
import { Footer } from '../../components/Footer/Footer'
import { Destaques } from '../../components/Destaques/Destaques'

import styles from './Home.module.css'

export function Home() {
  return (
    <main className={styles.container}>
      <NavBar />
      <Hero />
      <Destaques />
      <Footer />
    </main>
  )
}
