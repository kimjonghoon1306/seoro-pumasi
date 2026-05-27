import { useTheme } from '../../lib/theme'
import styles from './ThemeBar.module.css'

export default function ThemeBar() {
  const { theme, fontSize, toggleTheme, setFontSize } = useTheme()

  return (
    <div className={styles.bar}>
      <div className={styles.group}>
        <span className={styles.label}>글자 크기</span>
        <div className={styles.btns}>
          <button className={`${styles.sizeBtn} ${fontSize === 'normal' ? styles.active : ''}`} onClick={() => setFontSize('normal')}>가</button>
          <button className={`${styles.sizeBtn} ${styles.sizeMd} ${fontSize === 'large'  ? styles.active : ''}`} onClick={() => setFontSize('large')}>가</button>
          <button className={`${styles.sizeBtn} ${styles.sizeLg} ${fontSize === 'xlarge' ? styles.active : ''}`} onClick={() => setFontSize('xlarge')}>가</button>
        </div>
      </div>
      <button className={styles.themeBtn} onClick={toggleTheme}>
        {theme === 'light' ? '🌙 어둡게' : '☀️ 밝게'}
      </button>
    </div>
  )
}
