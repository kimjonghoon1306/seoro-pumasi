import { useState, useEffect } from 'react'
import { Link, useLocation } from 'wouter'
import { useTheme } from '../../lib/theme'
import type { FontSize } from '../../lib/theme'
import styles from './Header.module.css'

interface HeaderProps {
  points?: number
  nickname?: string
  onLogout?: () => void
}

const NAV_ITEMS = [
  { href: '/dashboard', label: '내 현황', icon: '⬡' },
  { href: '/missions',  label: '미션 목록', icon: '◈' },
  { href: '/register',  label: '미션 올리기', icon: '✦' },
  { href: '/mypage',    label: '마이페이지', icon: '◉' },
]

export default function Header({ points = 0, nickname, onLogout }: HeaderProps) {
  const [location] = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { theme, fontSize, toggleTheme, setFontSize } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setDrawerOpen(false)
  }, [location])

  return (
    <>
      {/* 테마바 */}
      <div className={styles.themeBar}>
        <div className={styles.themeGroup}>
          <span className={styles.themeLabel}>글자 크기</span>
          <div className={styles.sizeBtns}>
            {(['normal','large','xlarge'] as FontSize[]).map((s, i) => (
              <button
                key={s}
                className={`${styles.sizeBtn} ${i===1?styles.sizeBtnMd:i===2?styles.sizeBtnLg:''} ${fontSize===s?styles.sizeActive:''}`}
                onClick={() => setFontSize(s)}
              >가</button>
            ))}
          </div>
        </div>
        <button className={styles.darkBtn} onClick={toggleTheme}>
          {theme === 'light' ? '🌙 어둡게' : '☀️ 밝게'}
        </button>
      </div>

      {/* 헤더 */}
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>

          {/* 로고 */}
          <Link href="/" className={styles.logo}>
            <div className={styles.logoMark}>
              <svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="38" height="38" rx="10" fill="url(#logoGrad)"/>
                <path d="M19 8 C13 8 9 12 9 17 C9 20 10.5 22.5 13 24 L11 30 L17 26.5 C17.6 26.6 18.3 26.7 19 26.7 C25 26.7 29 22.7 29 17 C29 12 25 8 19 8Z" fill="white" opacity="0.95"/>
                <path d="M15 16 Q19 13 23 16" stroke="#0a2a16" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                <circle cx="15" cy="18" r="1.5" fill="#0a2a16"/>
                <circle cx="23" cy="18" r="1.5" fill="#0a2a16"/>
                <path d="M16 21 Q19 23 22 21" stroke="#0a2a16" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                <defs>
                  <linearGradient id="logoGrad" x1="0" y1="0" x2="38" y2="38">
                    <stop stopColor="#22a05a"/>
                    <stop offset="1" stopColor="#0f3d20"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className={styles.logoText}>
              <span className={styles.logoName}>서로품앗이</span>
              <span className={styles.logoDomain}>seoro-pumasi.com</span>
            </div>
          </Link>

          {/* PC 네비 */}
          {nickname && (
            <nav className={styles.nav}>
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navItem} ${location === item.href ? styles.active : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* 우측 */}
          <div className={styles.right}>
            {nickname ? (
              <>
                <div className={styles.pointPill}>
                  <span>⭐</span>
                  <strong>{points.toLocaleString()}</strong>
                  <span style={{ opacity: 0.6 }}>P</span>
                </div>
                <div className={styles.avatarBtn}>
                  <div className={styles.avatar}>{nickname[0]}</div>
                  <span className={styles.nickname}>{nickname}</span>
                </div>
                <button className={styles.logoutBtn} onClick={onLogout}>로그아웃</button>
              </>
            ) : (
              <Link href="/login" className={styles.loginBtn}>
                시작하기 →
              </Link>
            )}

            {/* 모바일 햄버거 */}
            {nickname && (
              <button className={styles.menuBtn} onClick={() => setDrawerOpen(true)} aria-label="메뉴">
                <span className={styles.menuLine}/>
                <span className={styles.menuLine}/>
                <span className={styles.menuLine}/>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 모바일 드로어 */}
      {nickname && (
        <div className={`${styles.drawer} ${drawerOpen ? styles.open : ''}`}>
          <div className={styles.drawerOverlay} onClick={() => setDrawerOpen(false)}/>
          <div className={styles.drawerPanel}>
            <div className={styles.pointPill}>
              <span>⭐</span>
              <strong>{points.toLocaleString()}</strong>
              <span style={{ opacity: 0.6 }}>P 보유 중</span>
            </div>
            <nav className={styles.drawerNav}>
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.drawerNavItem} ${location===item.href ? styles.active : ''}`}
                >
                  {item.icon} {item.label}
                </Link>
              ))}
            </nav>
            <button className={styles.logoutBtn} onClick={onLogout} style={{ marginTop: 'auto', textAlign: 'left' }}>
              로그아웃
            </button>
          </div>
        </div>
      )}
    </>
  )
}
