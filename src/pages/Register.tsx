import { useState } from 'react'
import { useLocation, Link } from 'wouter'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { MISSION_LABELS, MISSION_POINTS, MISSION_EMOJI } from '../types'
import type { MissionType } from '../types'
import styles from './Register.module.css'

const TYPES: MissionType[] = ['neighbor', 'like', 'comment']

export default function Register() {
  const { user } = useAuth()
  const [, setLocation] = useLocation()

  const [type, setType]       = useState<MissionType | null>(null)
  const [blogUrl, setBlogUrl] = useState('')
  const [count, setCount]     = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // user null 체크 후 명시적 타입 지정
  if (!user) return null
  const currentUser = user

  const costPerOne = type ? MISSION_POINTS[type].cost : 0
  const totalCost  = costPerOne * count
  const canAfford  = currentUser.points >= totalCost

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!type)           { setError('미션 종류를 선택해 주세요.'); return }
    if (!blogUrl.trim()) { setError('블로그 주소를 입력해 주세요.'); return }
    if (!canAfford)      { setError('포인트가 부족해요. 미션을 먼저 수행해서 포인트를 모아주세요!'); return }

    setLoading(true)
    try {
      const { error: missionErr } = await supabase.from('missions').insert({
        owner_id:    currentUser.id,
        blog_url:    blogUrl.trim().startsWith('http') ? blogUrl.trim() : `https://blog.naver.com/${blogUrl.trim()}`,
        type,
        points:      MISSION_POINTS[type].earn,
        total_count: count,
        done_count:  0,
        status:      'active',
      })
      if (missionErr) throw missionErr

      const { error: pointErr } = await supabase
        .from('users')
        .update({ points: currentUser.points - totalCost })
        .eq('id', currentUser.id)
      if (pointErr) throw pointErr

      setLocation('/dashboard')
    } catch {
      setError('등록 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <Link href="/dashboard" className="back-btn">← 대시보드로 돌아가기</Link>

      <div className={styles.header}>
        <h1 className={styles.title}>✏️ 미션 올리기</h1>
        <p className={styles.desc}>
          포인트를 써서 내 블로그에 이웃을 늘려요!<br />
          다른 분들이 미션을 완료하면 실제로 이웃이 생겨요 😊
        </p>
        <div className={styles.myPoint}>
          내 포인트: <strong>⭐ {currentUser.points.toLocaleString()} P</strong>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.stepNum}>1</span>
            어떤 활동을 원하세요?
          </h2>
          <div className={styles.typeGrid}>
            {TYPES.map(t => (
              <button
                key={t}
                type="button"
                className={`${styles.typeCard} ${type === t ? styles.typeSelected : ''}`}
                onClick={() => setType(t)}
              >
                <span className={styles.typeEmoji}>{MISSION_EMOJI[t]}</span>
                <span className={styles.typeLabel}>{MISSION_LABELS[t]}</span>
                <span className={styles.typeCost}>1회당 {MISSION_POINTS[t].cost}P 소모</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.stepNum}>2</span>
            내 블로그 주소를 입력해 주세요
          </h2>
          <input
            className={styles.input}
            type="text"
            placeholder="예) blog.naver.com/내아이디  또는  내아이디만 입력"
            value={blogUrl}
            onChange={e => setBlogUrl(e.target.value)}
          />
          <p className={styles.hint}>💡 블로그 아이디만 입력해도 괜찮아요!</p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.stepNum}>3</span>
            몇 명에게 받고 싶으세요?
          </h2>
          <div className={styles.countWrap}>
            <button type="button" className={styles.countBtn} onClick={() => setCount(c => Math.max(1, c - 1))}>－</button>
            <span className={styles.countNum}>{count}명</span>
            <button type="button" className={styles.countBtn} onClick={() => setCount(c => Math.min(50, c + 1))}>＋</button>
          </div>
          <p className={styles.hint}>최대 50명까지 설정할 수 있어요</p>
        </div>

        {type && (
          <div className={`${styles.summary} ${!canAfford ? styles.summaryRed : ''}`}>
            <div className={styles.summaryRow}>
              <span>미션 종류</span>
              <strong>{MISSION_EMOJI[type]} {MISSION_LABELS[type]}</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>인원 수</span>
              <strong>{count}명</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>1회 비용</span>
              <strong>{costPerOne}P</strong>
            </div>
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>총 필요 포인트</span>
              <strong className={canAfford ? styles.afford : styles.noAfford}>
                {totalCost}P {!canAfford && '← 포인트 부족!'}
              </strong>
            </div>
          </div>
        )}

        {error && <div className={styles.error}>⚠️ {error}</div>}

        <button
          className={styles.submitBtn}
          type="submit"
          disabled={loading || !canAfford || !type}
        >
          {loading ? '등록 중...' : `🚀 미션 등록하기 (${totalCost}P 차감)`}
        </button>

        {!canAfford && type && (
          <p className={styles.noAffordMsg}>
            포인트가 부족해요. 먼저{' '}
            <a href="/missions" className={styles.goMissions}>미션을 수행</a>
            해서 포인트를 모아주세요!
          </p>
        )}
      </form>
    </div>
  )
}
