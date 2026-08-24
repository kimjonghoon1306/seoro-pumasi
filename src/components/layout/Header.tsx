import { useEffect, useState } from 'react'
import { Link, useLocation } from 'wouter'
import { useTheme } from '../../lib/theme'
import styles from './Header.module.css'
import NotificationBell from '../NotificationBell'

interface HeaderProps { points?: number; nickname?: string; userId?: string; onLogout?: () => void }

const NAV_ITEMS = [
  { href: '/dashboard', label: '대시보드' },
  { href: '/missions', label: '미션 찾기' },
  { href: '/community', label: '서로 광장' },
  { href: '/register', label: '미션 만들기' },
  { href: '/mypage', label: '내 정보' },
]

export default function Header({ points = 0, nickname, userId, onLogout }: HeaderProps) {
  const [location] = useLocation()
  const [open, setOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => setOpen(false), [location])

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} aria-label="서로품앗이 홈">
          <span className={styles.logoMark}>ㅅㄹ</span>
          <span><strong>서로품앗이</strong><small>PARTICIPATION NETWORK</small></span>
        </Link>

        {nickname ? <nav className={styles.nav} aria-label="주요 메뉴">
          {NAV_ITEMS.map(item => <Link key={item.href} href={item.href} className={location === item.href ? styles.active : ''}>{item.label}</Link>)}
        </nav> : <span className={styles.publicMessage}>사람과 사람 사이에 좋은 일이 흐르도록</span>}

        <div className={styles.actions}>
          <button className={styles.themeButton} onClick={toggleTheme} aria-label={theme === 'light' ? '다크 모드' : '라이트 모드'}>{theme === 'light' ? '◐' : '○'}</button>
          {nickname ? <>
            {userId && <NotificationBell userId={userId} />}
            <Link href="/mypage" className={styles.profile}><span>{nickname.slice(0, 1)}</span><b>{nickname}</b></Link>
            <span className={styles.points}>{points.toLocaleString()} P</span>
            <button className={styles.logout} onClick={onLogout}>로그아웃</button>
            <button className={styles.menu} onClick={() => setOpen(value => !value)} aria-expanded={open} aria-label="메뉴 열기"><i/><i/></button>
          </> : <Link href="/login" className={styles.start}>시작하기 <span>↗</span></Link>}
        </div>
      </div>

      {nickname && open ? <div className={styles.mobileNav}>
        {NAV_ITEMS.map(item => <Link key={item.href} href={item.href}>{item.label}<span>→</span></Link>)}
        <button onClick={onLogout}>로그아웃</button>
      </div> : null}
    </header>
  )
}
