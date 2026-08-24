import { useState } from 'react'
import { useLocation, Link } from 'wouter'
import { useAuth } from '../hooks/useAuth'
import styles from './Login.module.css'

type Tab = 'login' | 'signup'

function normalizeProfileUrl(raw: string): string {
  const t = raw.trim()
  if (!t) return ''
  if (t.startsWith('http')) return t
  if (t.includes('.')) return `https://${t}`
  return `https://blog.naver.com/${t}`
}

export default function Login() {
  const [tab, setTab]           = useState<Tab>('login')
  const [, setLocation]         = useLocation()
  const { signIn, signUp }      = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [step, setStep]         = useState<1|2>(1)
  const [nickname, setNickname] = useState('')
  const [blogUrl, setBlogUrl]   = useState('')

  function reset() { setError(''); setEmail(''); setPassword(''); setNickname(''); setBlogUrl(''); setStep(1); setShowPw(false) }
  function switchTab(t: Tab) { setTab(t); reset() }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setError('')
    if (!email || !password) { setError('이메일과 비밀번호를 모두 입력해 주세요.'); return }
    setLoading(true)
    try { await signIn(email, password); setLocation('/dashboard') }
    catch { setError('이메일 또는 비밀번호가 맞지 않아요.') }
    finally { setLoading(false) }
  }

  function handleStep1(e: React.FormEvent) {
    e.preventDefault(); setError('')
    if (!email) { setError('이메일 주소를 입력해 주세요.'); return }
    if (!email.includes('@')) { setError('이메일 주소 형식이 맞지 않아요. (예: abc@naver.com)'); return }
    if (password.length < 8) { setError('비밀번호는 8자리 이상으로 만들어 주세요.'); return }
    setStep(2)
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault(); setError('')
    if (!nickname.trim()) { setError('닉네임을 입력해 주세요.'); return }
    if (!blogUrl.trim())  { setError('대표 활동 링크를 입력해 주세요.'); return }
    setLoading(true)
    try { await signUp(email, password, nickname.trim(), normalizeProfileUrl(blogUrl)); setLocation('/dashboard') }
    catch (err: unknown) {
      const msg = (err as Error).message || ''
      setError(msg.includes('already registered') ? '이미 가입된 이메일이에요.' : '가입 중 문제가 생겼어요.')
    }
    finally { setLoading(false) }
  }

  return (
    <div className={styles.wrap}>

      {/* 좌측 비주얼 */}
      <div className={styles.visual}>
        <div className={styles.visualBg}/>
        <div className={styles.visualOrb}/>
        <div className={styles.visualOrb}/>
        <div className={styles.visualContent}>
          <div className={styles.visualLogo}>
            <div className={styles.visualLogoMark}>서</div>
            <span className={styles.visualLogoName}>서로품앗이</span>
          </div>
          <p className={styles.visualTagline}>
            체험하고, 만들고, 돕고, 함께 키우는 사람들.<br/>
            하나의 프로필로 여러 월드를 자유롭게 오가세요
          </p>
          <div className={styles.visualStats}>
            <div className={styles.visualStat}>
              <span className={styles.visualStatEmoji}>✦</span>
              <span className={styles.visualStatText}>체험단 <strong>경험하기</strong></span>
            </div>
            <div className={styles.visualStat}>
              <span className={styles.visualStatEmoji}>✎</span>
              <span className={styles.visualStatText}>퍼블리 <strong>만들기</strong></span>
            </div>
            <div className={styles.visualStat}>
              <span className={styles.visualStatEmoji}>↗</span>
              <span className={styles.visualStatText}>파트너·팜 <strong>연결하기</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 우측 폼 */}
      <div className={styles.formPanel}>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab==='login' ?styles.active:''}`} onClick={()=>switchTab('login')}>로그인</button>
          <button className={`${styles.tab} ${tab==='signup'?styles.active:''}`} onClick={()=>switchTab('signup')}>회원가입</button>
        </div>

        {tab === 'login' && (
          <form onSubmit={handleLogin} className={styles.form}>
            <div>
              <h2 className={styles.formTitle}>반갑습니다!</h2>
              <p className={styles.formDesc}>가입하셨던 이메일과 비밀번호를 입력해 주세요</p>
            </div>
            <label className={styles.label}>
              이메일 주소
              <input className={styles.input} type="email" placeholder="abc@naver.com"
                value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/>
            </label>
            <label className={styles.label}>
              비밀번호
              <div className={styles.pwWrap}>
                <input className={styles.input} type={showPw?'text':'password'}
                  placeholder="비밀번호 입력" value={password}
                  onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/>
                <button type="button" className={styles.eyeBtn} onClick={()=>setShowPw(v=>!v)}>
                  {showPw?'🙈':'👁️'}
                </button>
              </div>
            </label>
            <div className={styles.findLinks}>
              <Link href="/find-email"    className={styles.findLink}>이메일 찾기</Link>
              <span className={styles.findDivider}>|</span>
              <Link href="/find-password" className={styles.findLink}>비밀번호 찾기</Link>
            </div>
            {error && <div className={styles.error}>⚠️ {error}</div>}
            <button className={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? '로그인 중...' : '로그인하기'}
            </button>
            <button type="button" className={styles.switchLink} onClick={()=>switchTab('signup')}>
              아직 회원이 아니에요 → 회원가입
            </button>
          </form>
        )}

        {tab === 'signup' && (
          <>
            <div className={styles.stepBar}>
              <div className={`${styles.stepDot} ${step>=1?styles.stepOn:''}`}>1</div>
              <div className={styles.stepLine}/>
              <div className={`${styles.stepDot} ${step>=2?styles.stepOn:''}`}>2</div>
            </div>

            {step === 1 && (
              <form onSubmit={handleStep1} className={styles.form}>
                <div>
                  <h2 className={styles.formTitle}>처음 오셨군요!</h2>
                  <p className={styles.formDesc}>이메일과 비밀번호를 정해주세요 (1/2)</p>
                </div>
                <label className={styles.label}>
                  이메일 주소
                  <input className={styles.input} type="email" placeholder="abc@naver.com"
                    value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/>
                </label>
                <label className={styles.label}>
                  비밀번호 만들기
                  <div className={styles.pwWrap}>
                    <input className={styles.input} type={showPw?'text':'password'}
                      placeholder="8자리 이상" value={password}
                      onChange={e=>setPassword(e.target.value)} autoComplete="new-password"/>
                    <button type="button" className={styles.eyeBtn} onClick={()=>setShowPw(v=>!v)}>
                      {showPw?'🙈':'👁️'}
                    </button>
                  </div>
                  <span className={styles.hint}>숫자와 영문자를 섞어 8자리 이상</span>
                </label>
                {error && <div className={styles.error}>⚠️ {error}</div>}
                <button className={styles.submitBtn} type="submit">다음 단계로 →</button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleSignup} className={styles.form}>
                <div>
                  <h2 className={styles.formTitle}>거의 다 왔어요!</h2>
                  <p className={styles.formDesc}>이름과 대표 활동 링크를 알려주세요 (2/2)</p>
                </div>
                <label className={styles.label}>
                  닉네임
                  <input className={styles.input} type="text" placeholder="활동할 때 사용할 이름"
                    value={nickname} onChange={e=>setNickname(e.target.value)} maxLength={12}/>
                  <span className={styles.hint}>12자 이내로 자유롭게</span>
                </label>
                <label className={styles.label}>
                  대표 활동 링크
                  <input className={styles.input} type="text"
                    placeholder="블로그 · SNS · 쇼핑몰 · 포트폴리오 주소"
                    value={blogUrl} onChange={e=>setBlogUrl(e.target.value)}/>
                  <span className={styles.hint}>지금은 가장 자주 사용하는 링크 하나만 알려주세요</span>
                </label>
                {error && <div className={styles.error}>⚠️ {error}</div>}
                <div className={styles.btnRow}>
                  <button type="button" className={styles.backBtn}
                    onClick={()=>{setStep(1);setError('')}}>← 이전</button>
                  <button className={styles.submitBtn} type="submit" disabled={loading}>
                    {loading?'가입 중...':'가입 완료!'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>

      <Link href="/admin-login" className={styles.adminGear} title="관리자">⚙️</Link>
    </div>
  )
}
