import { useEffect, useMemo, useState } from 'react'
import { Link } from 'wouter'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { MISSION_EMOJI, MISSION_LABELS } from '../types'
import type { Mission, MissionType } from '../types'
import styles from './Missions.module.css'

type Filter = 'all' | MissionType
type Sort = 'recommended' | 'points' | 'closing' | 'newest'

const FAVORITES_KEY = 'seoro-favorite-missions'
const INTERESTS_KEY = 'seoro-mission-interests'

export default function Missions() {
  const { user } = useAuth()
  const [missions,   setMissions]   = useState<Mission[]>([])
  const [doneIds,    setDoneIds]    = useState<Set<string>>(new Set())
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState<Filter>('all')
  const [sort,       setSort]       = useState<Sort>('recommended')
  const [query,      setQuery]      = useState('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]') as string[])
    } catch {
      return new Set()
    }
  })
  const [interests, setInterests] = useState<Set<MissionType>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(INTERESTS_KEY) || '["neighbor","like","comment"]') as MissionType[]
      return new Set(saved)
    } catch { return new Set(['neighbor', 'like', 'comment'] as MissionType[]) }
  })

  useEffect(() => {
    async function load() {
      try {
        // 미션 목록
        const { data: missionData } = await supabase
          .from('missions')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        const filtered = (missionData as Mission[] || []).filter(
          (m: Mission) => m.owner_id !== user?.id
        )
        setMissions(filtered)

        // 내가 이미 제출한 미션 ID 목록 (pending + approved 둘 다)
        if (user?.id) {
          const { data: completionData } = await supabase
            .from('completions')
            .select('mission_id')
            .eq('user_id', user.id)
            .in('status', ['pending', 'approved'])

          const ids = new Set(
            (completionData || []).map((c: { mission_id: string }) => c.mission_id)
          )
          setDoneIds(ids)
        }
      } catch {
        setMissions([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id])

  const displayed = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    const result = missions.filter((mission: Mission) => {
      if (filter !== 'all' && mission.type !== filter) return false
      if (favoritesOnly && !favoriteIds.has(mission.id)) return false
      if (!keyword) return true
      return `${mission.blog_url} ${mission.owner_nickname || ''}`.toLowerCase().includes(keyword)
    })

    return result.sort((a, b) => {
      if (sort === 'points') return b.points - a.points
      if (sort === 'closing') return (a.total_count - a.done_count) - (b.total_count - b.done_count)
      if (sort === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      const aDone = doneIds.has(a.id) ? 1 : 0
      const bDone = doneIds.has(b.id) ? 1 : 0
      if (aDone !== bDone) return aDone - bDone
      const interestGap = Number(interests.has(b.type)) - Number(interests.has(a.type))
      return interestGap || b.points - a.points || new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [missions, filter, favoritesOnly, favoriteIds, query, sort, doneIds, interests])

  function toggleFavorite(id: string) {
    setFavoriteIds(current => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]))
      return next
    })
  }

  function toggleInterest(type: MissionType) {
    setInterests(current => {
      const next = new Set(current)
      if (next.has(type) && next.size > 1) next.delete(type)
      else next.add(type)
      localStorage.setItem(INTERESTS_KEY, JSON.stringify([...next]))
      return next
    })
  }

  return (
    <div className={styles.wrap}>
      <Link href="/dashboard" className="back-btn">← 대시보드로 돌아가기</Link>

      {/* 상단 안내 */}
      <div className={styles.topBanner}>
        <img className={styles.guideCharacter} src="/characters/monggeul-explorer.png" alt="미션을 찾는 캐릭터 몽글" />
        <div className={styles.topLeft}>
          <h1 className={styles.title}>📋 미션 목록</h1>
          <p className={styles.desc}>
            아래 블로그를 방문해서 활동하고 포인트를 받아요!<br />
            활동 후 화면을 캡처해서 인증하면 포인트가 쌓여요. 몽글이가 좋은 미션을 찾아줄게요!
          </p>
        </div>
        <Link href="/register" className={styles.registerBtn}>
          ✏️ 내 미션 올리기
        </Link>
      </div>

      {/* 어떻게 하나요 */}
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

      {/* 필터 */}
      <div className={styles.filters}>
        {([
          { key: 'all',      label: '전체 보기',     emoji: '📋' },
          { key: 'neighbor', label: '서로이웃 추가', emoji: '🤝' },
          { key: 'like',     label: '공감 누르기',   emoji: '💛' },
          { key: 'comment',  label: '댓글 달기',     emoji: '💬' },
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

      <section className={styles.discovery} aria-label="미션 검색 및 정렬">
        <label className={styles.searchBox}>
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="블로그 주소나 닉네임 검색"
            aria-label="미션 검색"
          />
        </label>
        <select className={styles.sortSelect} value={sort} onChange={event => setSort(event.target.value as Sort)} aria-label="미션 정렬">
          <option value="recommended">푸미 추천순</option>
          <option value="points">포인트 높은순</option>
          <option value="closing">마감 임박순</option>
          <option value="newest">새로 등록된순</option>
        </select>
        <button
          type="button"
          className={`${styles.favoriteFilter} ${favoritesOnly ? styles.favoriteFilterActive : ''}`}
          onClick={() => setFavoritesOnly(value => !value)}
          aria-pressed={favoritesOnly}
        >
          {favoritesOnly ? '★ 찜한 미션만' : '☆ 찜한 미션'}
        </button>
        <span className={styles.resultCount}><b>{displayed.length}</b>개의 미션</span>
      </section>

      <section className={styles.recommendation}>
        <img src="/characters/pumi-guide.png" alt="추천을 안내하는 푸미" />
        <div><b>푸미에게 관심 활동 알려주기</b><span>선택한 활동을 추천순에서 먼저 보여드려요.</span></div>
        <div>{(['neighbor', 'like', 'comment'] as MissionType[]).map(type => <button key={type} className={interests.has(type) ? styles.interestActive : ''} onClick={() => toggleInterest(type)} aria-pressed={interests.has(type)}>{MISSION_EMOJI[type]} {MISSION_LABELS[type]}</button>)}</div>
      </section>

      {/* 목록 */}
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
            <MissionCard key={m.id} mission={m} isDone={doneIds.has(m.id)} isFavorite={favoriteIds.has(m.id)} onToggleFavorite={toggleFavorite} />
          ))}
        </div>
      )}
    </div>
  )
}

function MissionCard({ mission: m, isDone, isFavorite, onToggleFavorite }: { mission: Mission; isDone: boolean; isFavorite: boolean; onToggleFavorite: (id: string) => void }) {
  const remaining = m.total_count - m.done_count

  return (
    <div className={`${styles.card} ${isDone ? styles.cardDone : ''} card-shine`}>

      <button
        type="button"
        className={`${styles.favoriteButton} ${isFavorite ? styles.favoriteButtonActive : ''}`}
        onClick={() => onToggleFavorite(m.id)}
        aria-label={isFavorite ? '찜 해제하기' : '미션 찜하기'}
        aria-pressed={isFavorite}
      >{isFavorite ? '★' : '☆'}</button>

      {/* 완료 오버레이 뱃지 */}
      {isDone && (
        <div className={styles.doneBadge}>✅ 이미 완료했어요</div>
      )}

      {/* 미션 종류 배지 */}
      <div className={`${styles.typeBadge} ${styles['type_' + m.type]}`}>
        {MISSION_EMOJI[m.type as MissionType]} {MISSION_LABELS[m.type as MissionType]}
      </div>

      {/* 블로그 주소 */}
      <a href={m.blog_url} target="_blank" rel="noreferrer" className={styles.blogUrl}>
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

      {/* 인증 버튼 — 완료 시 비활성화 */}
      {isDone ? (
        <div className={styles.doneBtn}>
          ✅ 이미 인증했어요
        </div>
      ) : (
        <Link href={`/verify/${m.id}`} className={styles.doBtn}>
          ✅ 활동하고 인증하기
        </Link>
      )}
    </div>
  )
}
