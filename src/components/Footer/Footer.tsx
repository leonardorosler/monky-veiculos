import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.footerTexto}>
        © {new Date().getFullYear()} Monky. Todos os direitos reservados.
      </p>
    </footer>
  )
}