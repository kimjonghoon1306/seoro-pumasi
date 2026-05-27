import { useEffect, useState } from 'react'
import { Link } from 'wouter'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { MISSION_EMOJI, MISSION_LABELS } from '../types'
import type { Mission, MissionType } from '../types'
import styles from './Missions.module.css'

type Filter = 'all' | MissionType

export default function Missions() {
  const { user } = useAuth()
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('missions')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
        // 내 미션 제외 (어뷰징 방지)
        const filtered = (data as Mission[] || []).filter(
          (m: Mission) => m.owner_id !== user?.id
        )
        setMissions(filtered)
      } catch {
        setMissions([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id])

  const displayed = filter === 'all'
    ? missions
    : missions.filter((m: Mission) => m.type === filter)

  return (
    <div className={styles.wrap}>

      {/* 상단 안내 */}
      <div className={styles.topBanner}>
        <div className={styles.topLeft}>
          <h1 className={styles.title}>📋 미션 목록</h1>
          <p className={styles.desc}>
            아래 블로그를 방문해서 활동하고 포인트를 받아요!<br />
            활동 후 화면을 캡처해서 인증하면 포인트가 쌓여요 ⭐
          </p>
        </div>
        <Link href="/register" className={styles.registerBtn}>
          ✏️ 내 미션 올리기
        </Link>
      </div>

      {/* 어떻게 하나요 안내 */}
      <div className={styles.howTo}>
        <div className={styles.howStep}>
          <span className={styles.howNum}>1</span>
          <span>아래 블로그 주소 클릭해서 방문</span>
        </div>
        <div className={styles.howArrow}>→</div>
        <div className={styles.howStep}>
          <span className={styles.howNum}>2</span>
          <span>서로이웃·공감·댓글 중 해당 활동 하기</span>
        </div>
        <div className={styles.howArrow}>→</div>
        <div className={styles.howStep}>
          <span className={styles.howNum}>3</span>
          <span>화면 캡처 후 [인증하기] 버튼 클릭</span>
        </div>
      </div>

      {/* 필터 탭 */}
      <div className={styles.filters}>
        {([
          { key: 'all',      label: '전체 보기',      emoji: '📋' },
          { key: 'neighbor', label: '서로이웃 추가',  emoji: '🤝' },
          { key: 'like',     label: '공감 누르기',    emoji: '💛' },
          { key: 'comment',  label: '댓글 달기',      emoji: '💬' },
        ] as { key: Filter; label: string; emoji: string }[]).map(f => (
          <button
            key={f.key}
            className={`${styles.filterBtn} ${filter === f.key ? styles.filterActive : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.emoji} {f.label}
          </button>
        ))}
      </div>

      {/* 미션 카드 목록 */}
      {loading ? (
        <div className={styles.loading}>
          <span className={styles.loadingEmoji}>⏳</span>
          <p>미션 불러오는 중이에요...</p>
        </div>
      ) : displayed.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyEmoji}>🙈</span>
          <p>지금은 수행할 수 있는 미션이 없어요</p>
          <p className={styles.emptyDesc}>잠시 후 다시 확인해 주세요!</p>
        </div>
      ) : (
        <div className={styles.cardGrid}>
          {displayed.map((m: Mission) => (
            <MissionCard key={m.id} mission={m} />
          ))}
        </div>
      )}

    </div>
  )
}

function MissionCard({ mission: m }: { mission: Mission }) {
  const remaining = m.total_count - m.done_count

  return (
    <div className={styles.card}>
      {/* 미션 종류 배지 */}
      <div className={`${styles.typeBadge} ${styles['type_' + m.type]}`}>
        {MISSION_EMOJI[m.type as MissionType]} {MISSION_LABELS[m.type as MissionType]}
      </div>

      {/* 블로그 주소 */}
      <a
        href={m.blog_url}
        target="_blank"
        rel="noreferrer"
        className={styles.blogUrl}
      >
        🔗 {m.blog_url}
      </a>

      {/* 설명 */}
      <p className={styles.cardDesc}>
        {m.type === 'neighbor' && '이 블로그에 서로이웃 신청을 해주세요'}
        {m.type === 'like'     && '이 블로그 글에 공감을 눌러주세요'}
        {m.type === 'comment'  && '이 블로그 글에 댓글을 달아주세요 (30자 이상)'}
      </p>

      {/* 포인트 + 남은 수량 */}
      <div className={styles.cardMeta}>
        <span className={styles.pointBadge}>⭐ +{m.points} 포인트</span>
        <span className={styles.remaining}>남은 수량 {remaining}개</span>
      </div>

      {/* 인증하기 버튼 */}
      <Link href={`/verify/${m.id}`} className={styles.doBtn}>
        ✅ 활동하고 인증하기
      </Link>
    </div>
  )
}
