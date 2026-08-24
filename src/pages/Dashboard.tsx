import { Link } from 'wouter'
import { useAuth } from '../hooks/useAuth'
import { useMyMissions, useMyCompletions } from '../hooks/useMissions'
import { MISSION_LABELS } from '../types'
import type { Completion, Mission, MissionType } from '../types'
import styles from './Dashboard.module.css'

function statusLabel(status: Mission['status']) {
  if (status === 'active') return '진행 중'
  if (status === 'paused') return '일시정지'
  return '완료'
}

export default function Dashboard() {
  const { user } = useAuth()
  const { missions } = useMyMissions(user?.id)
  const { completions } = useMyCompletions(user?.id)
  if (!user) return null

  const approved = completions.filter((item: Completion) => item.status === 'approved').length
  const pending = completions.filter((item: Completion) => item.status === 'pending').length
  const rejected = completions.filter((item: Completion) => item.status === 'rejected').length
  const active = missions.filter((item: Mission) => item.status === 'active').length
  const reviewed = approved + rejected
  const trustRate = reviewed ? Math.round((approved / reviewed) * 100) : 100

  return (
    <div className={styles.page}>
      <section className={styles.welcome}>
        <div><span className={styles.eyebrow}>YOUR NEXT ADVENTURE</span><h1>{user.nickname}님,<br /><em>오늘은 어떤 일</em>을 해볼까요?</h1><a href={user.blog_url} target="_blank" rel="noreferrer">내 연결 프로필 보기 ↗</a></div>
        <div className={styles.welcomeFriend}><span>푸미의 오늘 추천</span><b>새로운 월드에<br />재미있는 일이 도착했어!</b><img src="/characters/pumi-guide.png" alt="안내 캐릭터 푸미" /></div>
        <div className={styles.balance}><span>사용 가능한 포인트</span><strong>{user.points.toLocaleString()}</strong><small>POINT</small><Link href="/register">미션 만들기 →</Link></div>
      </section>

      <section className={styles.quick}>
        <Link href="/missions"><span>01</span><div><b>오늘의 퀘스트</b><small>지금 참여할 수 있는 재미있는 일 발견하기</small></div><i>→</i></Link>
        <Link href="/register"><span>02</span><div><b>도움 요청하기</b><small>사람들과 함께 해결하고 싶은 일 올리기</small></div><i>→</i></Link>
      </section>

      <section className={styles.metrics}>
        {[['완료한 참여', approved], ['확인 중', pending], ['진행 중 퀘스트', active], ['나의 신뢰도', `${trustRate}%`]].map(([label, value]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
      </section>

      <div className={styles.contentGrid}>
        <section className={styles.panel}>
          <header><div><span className={styles.eyebrow}>MY MISSIONS</span><h2>내가 만든 미션</h2></div><Link href="/register">+ 새 미션</Link></header>
          {missions.length === 0 ? <div className={styles.empty}><b>아직 만든 미션이 없어요.</b><p>활동으로 포인트를 모은 뒤 내 블로그를 알려보세요.</p><Link href="/missions">첫 미션 수행하기 →</Link></div> : <div className={styles.missionList}>
            {missions.slice(0, 6).map((mission: Mission) => {
              const percentage = Math.min(100, Math.round((mission.done_count / mission.total_count) * 100))
              return <article key={mission.id}><div className={styles.typeMark}>{mission.type === 'neighbor' ? 'N' : mission.type === 'like' ? 'L' : 'C'}</div><div className={styles.missionInfo}><b>{MISSION_LABELS[mission.type as MissionType]}</b><span>{mission.done_count} / {mission.total_count}명 완료</span><div><i style={{ width: `${percentage}%` }} /></div></div><span className={`${styles.status} ${styles[mission.status]}`}>{statusLabel(mission.status)}</span></article>
            })}
          </div>}
        </section>

        <aside className={styles.side}>
          <section className={styles.panel}><header><div><span className={styles.eyebrow}>RECENT</span><h2>최근 인증</h2></div></header>{completions.length === 0 ? <p className={styles.sideEmpty}>아직 인증 내역이 없습니다.</p> : <div className={styles.recent}>{completions.slice(0, 5).map((item: Completion) => <div key={item.id}><span className={styles[item.status]}>{item.status === 'approved' ? '승인' : item.status === 'rejected' ? '반려' : '검토 중'}</span><time>{new Date(item.created_at).toLocaleDateString('ko-KR')}</time></div>)}</div>}</section>
          <section className={styles.note}><img src="/characters/bori-cheer.png" alt="응원 캐릭터 보리" /><div><span>보리의 응원</span><h3>진심이 보이는 활동을 남겨주세요.</h3><p>글을 읽고 남긴 구체적인 댓글은 더 좋은 관계로 이어집니다.</p></div></section>
        </aside>
      </div>
    </div>
  )
}
