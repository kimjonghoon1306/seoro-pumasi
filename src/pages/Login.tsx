import { useState } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '../hooks/useAuth'
import styles from './Login.module.css'

type Tab = 'login' | 'signup'

// 블로그 주소 정규화: naver.me/xxx → 그대로, blog.naver.com/xxx → 그대로
// 사용자가 아이디만 입력하면 앞에 자동 붙여주기
function normalizeBlogUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('http')) return trimmed
  if (trimmed.includes('blog.naver.com')) return `https://${trimmed}`
  // 아이디만 입력한 경우
  return `https://blog.naver.com/${trimmed}`
}

export default function Login() {
  const [tab, setTab] = useState<Tab>('login')
  const [, setLocation] = useLocation()
  const { signIn, signUp } = useAuth()

  // 공통
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  // 회원가입 전용
  const [step, setStep]           = useState<1 | 2>(1)
  const [nickname, setNickname]   = useState('')
  const [blogUrl, setBlogUrl]     = useState('')

  function reset() {
    setError('')
    setEmail('')
    setPassword('')
    setNickname('')
    setBlogUrl('')
    setStep(1)
    setShowPw(false)
  }

  function switchTab(t: Tab) {
    setTab(t)
    reset()
  }

  // ── 로그인 제출 ──
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('이메일과 비밀번호를 모두 입력해 주세요.'); return }
    setLoading(true)
    try {
      await signIn(email, password)
      setLocation('/dashboard')
    } catch {
      setError('이메일 또는 비밀번호가 맞지 않아요. 다시 확인해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  // ── 회원가입 1단계 → 2단계 ──
  function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email) { setError('이메일 주소를 입력해 주세요.'); return }
    if (!email.includes('@')) { setError('이메일 주소 형식이 맞지 않아요. (예: abc@naver.com)'); return }
    if (password.length < 8) { setError('비밀번호는 8자리 이상으로 만들어 주세요.'); return }
    setStep(2)
  }

  // ── 회원가입 최종 제출 ──
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!nickname.trim()) { setError('닉네임을 입력해 주세요.'); return }
    if (!blogUrl.trim()) { setError('블로그 주소를 입력해 주세요.'); return }
    setLoading(true)
    try {
      await signUp(email, password, nickname.trim(), normalizeBlogUrl(blogUrl))
      setLocation('/dashboard')
    } catch (err: unknown) {
      const msg = (err as Error).message || ''
      if (msg.includes('already registered')) setError('이미 가입된 이메일이에요. 로그인을 해주세요!')
      else setError('가입 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrap}>
      {/* 로고 */}
      <div className={styles.logo}>
        <div className={styles.logoMark}>서</div>
        <span className={styles.logoName}>서로품앗이</span>
      </div>

      {/* 탭 */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'login'  ? styles.active : ''}`}
          onClick={() => switchTab('login')}
        >로그인</button>
        <button
          className={`${styles.tab} ${tab === 'signup' ? styles.active : ''}`}
          onClick={() => switchTab('signup')}
        >회원가입</button>
      </div>

      <div className={styles.card}>

        {/* ════ 로그인 폼 ════ */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className={styles.form}>
            <h2 className={styles.formTitle}>반갑습니다! 👋</h2>
            <p className={styles.formDesc}>가입하셨던 이메일과 비밀번호를 입력해 주세요</p>

            <label className={styles.label}>
              📧 이메일 주소
              <input
                className={styles.input}
                type="email"
                placeholder="예) abc@naver.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>

            <label className={styles.label}>
              🔒 비밀번호
              <div className={styles.pwWrap}>
                <input
                  className={styles.input}
                  type={showPw ? 'text' : 'password'}
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </label>

            {error && <div className={styles.error}>⚠️ {error}</div>}

            <button className={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? '로그인 중...' : '✅ 로그인하기'}
            </button>

            <button
              type="button"
              className={styles.switchLink}
              onClick={() => switchTab('signup')}
            >
              아직 회원이 아니에요 → 회원가입하기
            </button>
          </form>
        )}

        {/* ════ 회원가입 폼 ════ */}
        {tab === 'signup' && (
          <>
            {/* 단계 표시 */}
            <div className={styles.stepBar}>
              <div className={`${styles.stepDot} ${step >= 1 ? styles.stepOn : ''}`}>1</div>
              <div className={styles.stepLine} />
              <div className={`${styles.stepDot} ${step >= 2 ? styles.stepOn : ''}`}>2</div>
            </div>

            {/* ── 1단계: 이메일·비밀번호 ── */}
            {step === 1 && (
              <form onSubmit={handleStep1} className={styles.form}>
                <h2 className={styles.formTitle}>처음 오셨군요! 🌱</h2>
                <p className={styles.formDesc}>이메일과 비밀번호를 정해주세요 (1/2 단계)</p>

                <label className={styles.label}>
                  📧 이메일 주소
                  <input
                    className={styles.input}
                    type="email"
                    placeholder="예) abc@naver.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </label>

                <label className={styles.label}>
                  🔒 비밀번호 만들기
                  <div className={styles.pwWrap}>
                    <input
                      className={styles.input}
                      type={showPw ? 'text' : 'password'}
                      placeholder="8자리 이상으로 만들어 주세요"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowPw(v => !v)}
                      aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
                    >
                      {showPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <span className={styles.hint}>숫자와 영문자를 섞어 8자리 이상 입력해 주세요</span>
                </label>

                {error && <div className={styles.error}>⚠️ {error}</div>}

                <button className={styles.submitBtn} type="submit">
                  다음 단계로 →
                </button>
              </form>
            )}

            {/* ── 2단계: 닉네임·블로그 ── */}
            {step === 2 && (
              <form onSubmit={handleSignup} className={styles.form}>
                <h2 className={styles.formTitle}>거의 다 왔어요! 😊</h2>
                <p className={styles.formDesc}>닉네임과 블로그 주소를 알려주세요 (2/2 단계)</p>

                <label className={styles.label}>
                  🙋 닉네임 (활동할 이름)
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="예) 꽃할머니, 블로그왕, 이웃사촌"
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    maxLength={12}
                  />
                  <span className={styles.hint}>12자 이내로 자유롭게 정해주세요</span>
                </label>

                <label className={styles.label}>
                  📝 내 네이버 블로그 주소
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="예) blog.naver.com/내아이디  또는  내아이디만 입력"
                    value={blogUrl}
                    onChange={e => setBlogUrl(e.target.value)}
                  />
                  <span className={styles.hint}>
                    블로그 아이디만 입력해도 괜찮아요!<br />
                    (네이버 블로그 주소에서 blog.naver.com/ 뒤에 오는 부분)
                  </span>
                </label>

                {error && <div className={styles.error}>⚠️ {error}</div>}

                <div className={styles.btnRow}>
                  <button
                    type="button"
                    className={styles.backBtn}
                    onClick={() => { setStep(1); setError('') }}
                  >
                    ← 이전
                  </button>
                  <button className={styles.submitBtn} type="submit" disabled={loading}>
                    {loading ? '가입 중...' : '🌱 가입 완료!'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}
