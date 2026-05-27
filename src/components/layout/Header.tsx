import { Link, useLocation } from 'wouter'
import styles from './Header.module.css'

interface HeaderProps {
  points?: number
  nickname?: string
  onLogout?: () => void
}

export default function Header({ points = 0, nickname, onLogout }: HeaderProps) {
  const [location] = useLocation()

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoMark}>서</div>
          <div className={styles.logoText}>
            <span className={styles.logoName}>서로품앗이</span>
            <span className={styles.logoDomain}>seoro-pumasi.com</span>
          </div>
        </Link>

        <div className={styles.right}>
          {nickname ? (
            <>
              <div className={styles.pointChip}>
                ⭐ <strong>{points.toLocaleString()}</strong> 포인트
              </div>
              <div className={styles.userArea}>
                <Link href="/mypage" className={styles.nicknameLink}>{nickname}님</Link>
                <button className={styles.logoutBtn} onClick={onLogout}>로그아웃</button>
              </div>
            </>
          ) : (
            <Link href="/login" className={styles.loginBtn}>🙋 시작하기</Link>
          )}
        </div>
      </div>

      {nickname && (
        <nav className={styles.nav}>
          <Link href="/dashboard" className={`${styles.navItem} ${location === '/dashboard' ? styles.active : ''}`}>🏠 내 현황</Link>
          <Link href="/missions"  className={`${styles.navItem} ${location === '/missions'  ? styles.active : ''}`}>📋 미션 목록</Link>
          <Link href="/register"  className={`${styles.navItem} ${location === '/register'  ? styles.active : ''}`}>✏️ 미션 올리기</Link>
          <Link href="/mypage"    className={`${styles.navItem} ${location === '/mypage'    ? styles.active : ''}`}>👤 마이페이지</Link>
        </nav>
      )}
    </header>
  )
}
