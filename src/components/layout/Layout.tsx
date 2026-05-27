import Header from './Header'
import styles from './Layout.module.css'

interface LayoutProps {
  children: React.ReactNode
  points?: number
  nickname?: string
  onLogout?: () => void
}

export default function Layout({ children, points, nickname, onLogout }: LayoutProps) {
  return (
    <div className={styles.root}>
      <Header points={points} nickname={nickname} onLogout={onLogout} />
      <main className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        <p>© 2025 서로품앗이 · 함께 키우는 블로그 이웃</p>
      </footer>
    </div>
  )
}
