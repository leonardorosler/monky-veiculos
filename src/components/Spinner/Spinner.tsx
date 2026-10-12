import styles from './Spinner.module.css'

export function Spinner() {
  return (
    <div className={styles.container} role="status">
      <div className={styles.spinner} aria-hidden="true" />
      <span className="sr-only">Carregando...</span>
    </div>
  )
}
