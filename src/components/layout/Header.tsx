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
        {/* 로고 */}
        <Link href="/" className={styles.logo}>
          <div className={styles.logoMark}>서</div>
          <div className={styles.logoText}>
            <span className={styles.logoName}>서로품앗이</span>
            <span className={styles.logoDomain}>seoro-pumasi.com</span>
          </div>
        </Link>

        {/* 우측 */}
        <div className={styles.right}>
          {nickname ? (
            <>
              {/* 포인트 */}
              <div className={styles.pointChip}>
                ⭐ <strong>{points.toLocaleString()}</strong> 포인트
              </div>

              {/* 내 정보 + 로그아웃 */}
              <div className={styles.userArea}>
                <span className={styles.nickname}>{nickname}님</span>
                <button className={styles.logoutBtn} onClick={onLogout}>
                  로그아웃
                </button>
              </div>
            </>
          ) : (
            <Link href="/login" className={styles.loginBtn}>
              🙋 시작하기
            </Link>
          )}
        </div>
      </div>

      {/* 하단 내비게이션 (로그인 시) */}
      {nickname && (
        <nav className={styles.nav}>
          <Link href="/dashboard" className={`${styles.navItem} ${location === '/dashboard' ? styles.active : ''}`}>
            🏠 내 현황
          </Link>
          <Link href="/missions" className={`${styles.navItem} ${location === '/missions' ? styles.active : ''}`}>
            📋 미션 목록
          </Link>
          <Link href="/register" className={`${styles.navItem} ${location === '/register' ? styles.active : ''}`}>
            ✏️ 미션 올리기
          </Link>
        </nav>
      )}
    </header>
  )
}
