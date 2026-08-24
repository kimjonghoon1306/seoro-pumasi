import { useEffect } from 'react'
import Header from './Header'
import styles from './Layout.module.css'

interface LayoutProps {
  children: React.ReactNode
  points?: number
  nickname?: string
  userId?: string
  onLogout?: () => void
}

export default function Layout({ children, points, nickname, userId, onLogout }: LayoutProps) {
  // 스크롤 트리거 Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            observer.unobserve(e.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  })

  return (
    <div className={styles.root}>
      <Header points={points} nickname={nickname} userId={userId} onLogout={onLogout} />
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLogo}>
            <span className={styles.footerLogoText}>서로품앗이</span>
            <span className={styles.footerTagline}>사람과 일이 만나는 참여 네트워크</span>
          </div>
          <p className={styles.footerCopy}>© {new Date().getFullYear()} 서로품앗이. 함께 발견하고, 만들고, 자랍니다.</p>
        </div>
      </footer>
    </div>
  )
}
