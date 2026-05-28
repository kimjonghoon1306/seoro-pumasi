import { useEffect } from 'react'
import Header from './Header'
import styles from './Layout.module.css'

interface LayoutProps {
  children: React.ReactNode
  points?: number
  nickname?: string
  onLogout?: () => void
}

export default function Layout({ children, points, nickname, onLogout }: LayoutProps) {
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
      <Header points={points} nickname={nickname} onLogout={onLogout} />
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLogo}>
            <span className={styles.footerLogoText}>서로품앗이</span>
            <span className={styles.footerTagline}>함께 키우는 블로그 이웃</span>
          </div>
          <p className={styles.footerCopy}>© 2025 서로품앗이. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
