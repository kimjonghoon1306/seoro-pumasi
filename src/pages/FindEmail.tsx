import { useState } from 'react'
import { Link } from 'wouter'
import { supabase } from '../lib/supabase'
import styles from './FindPassword.module.css'

function maskEmail(email: string) {
  const [local, domain] = email.split('@')
  if (!domain) return email
  const visible = local.slice(0, 2)
  const masked  = visible + '*'.repeat(Math.max(local.length - 2, 3))
  return `${masked}@${domain}`
}

export default function FindEmail() {
  const [nickname, setNickname] = useState('')
  const [blogUrl,  setBlogUrl]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [result,   setResult]   = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setResult(null)

    if (!nickname.trim()) {
      setError('닉네임을 입력해 주세요.')
      return
    }

    setLoading(true)
    try {
      let query = supabase
        .from('users')
        .select('email')
        .eq('nickname', nickname.trim())

      // 블로그 주소 입력하면 추가 조건
      if (blogUrl.trim()) {
        const normalized = blogUrl.includes('blog.naver.com')
          ? blogUrl.trim()
          : `https://blog.naver.com/${blogUrl.trim()}`
        query = query.eq('blog_url', normalized)
      }

      const { data, error: err } = await query.single()

      if (err || !data) {
        setError('해당 정보로 가입된 계정을 찾을 수 없어요.\n닉네임을 다시 확인해 주세요.')
        return
      }

      setResult(maskEmail(data.email))
    } catch {
      setError('조회 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  // 찾기 완료
  if (result) return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.doneEmoji}>🎉</div>
        <h2 className={styles.doneTitle}>이메일을 찾았어요!</h2>
        <p className={styles.doneDesc}>
          <strong>{nickname}</strong>님의 가입 이메일은
        </p>
        <div className={styles.emailResult}>
          📧 {result}
        </div>
        <p className={styles.doneNote}>
          보안을 위해 일부만 표시돼요.<br />
          기억나지 않으면 새 계정으로 가입해 주세요.
        </p>
        <div className={styles.resultBtns}>
          <Link href="/login" className={styles.backBtn}>
            → 로그인하러 가기
          </Link>
          <Link href="/find-password" className={styles.subBtn}>
            비밀번호도 찾기
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.icon}>📧</div>
        <h2 className={styles.title}>이메일 찾기</h2>
        <p className={styles.desc}>
          가입 시 사용한 닉네임을 입력하면<br />
          등록된 이메일을 알려드려요
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            닉네임 <span className={styles.required}>*</span>
            <input
              className={styles.input}
              type="text"
              placeholder="가입 시 사용한 닉네임"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              maxLength={12}
              autoFocus
            />
          </label>

          <label className={styles.label}>
            블로그 주소 <span className={styles.optional}>(선택 — 더 정확하게 찾아요)</span>
            <input
              className={styles.input}
              type="text"
              placeholder="blog.naver.com/아이디 또는 아이디만"
              value={blogUrl}
              onChange={e => setBlogUrl(e.target.value)}
            />
          </label>

          {error && (
            <div className={styles.error} style={{ whiteSpace: 'pre-line' }}>
              ⚠️ {error}
            </div>
          )}

          <button
            className={styles.btn}
            type="submit"
            disabled={loading || !nickname.trim()}
          >
            {loading ? '찾는 중...' : '🔍 이메일 찾기'}
          </button>
        </form>

        <div className={styles.bottomLinks}>
          <Link href="/find-password" className={styles.back}>
            비밀번호 찾기
          </Link>
          <span className={styles.dot}>·</span>
          <Link href="/login" className={styles.back}>
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
