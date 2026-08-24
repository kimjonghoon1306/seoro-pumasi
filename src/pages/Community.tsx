import { useEffect, useMemo, useState } from 'react'
import { Link } from 'wouter'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import styles from './Community.module.css'

type World = 'experience' | 'publish' | 'partner' | 'farm'
type Post = { id: string; author_id: string; world: World; title: string; content: string; created_at: string; users?: { nickname: string } | null }

const WORLDS: Array<{ id: World; name: string; icon: string; guide: string }> = [
  { id: 'experience', name: '체험단', icon: '✨', guide: '푸미' },
  { id: 'publish', name: '퍼블리', icon: '✍️', guide: '보리' },
  { id: 'partner', name: '온파트너', icon: '🤝', guide: '도도' },
  { id: 'farm', name: '온종일팜', icon: '🌾', guide: '몽글' },
]

export default function Community() {
  const { user } = useAuth()
  const [world, setWorld] = useState<World>('experience')
  const [posts, setPosts] = useState<Post[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [message, setMessage] = useState('')
  const [checkins, setCheckins] = useState<string[]>([])
  const [checkedToday, setCheckedToday] = useState(false)
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set())

  async function load() {
    if (!user) return
    const [{ data: postData }, { data: checkinData }, { data: blockData }] = await Promise.all([
      supabase.from('community_posts').select('*, users(nickname)').order('created_at', { ascending: false }).limit(60),
      supabase.from('checkins').select('checked_on').eq('user_id', user.id).order('checked_on', { ascending: false }).limit(30),
      supabase.from('blocks').select('blocked_id').eq('blocker_id', user.id),
    ])
    setPosts((postData as Post[]) || [])
    const dates = (checkinData || []).map((item: { checked_on: string }) => item.checked_on)
    setCheckins(dates)
    setCheckedToday(dates.includes(new Date().toISOString().slice(0, 10)))
    setBlockedIds(new Set((blockData || []).map((item: { blocked_id: string }) => item.blocked_id)))
  }

  useEffect(() => { load() }, [user?.id])

  const streak = useMemo(() => {
    const saved = new Set(checkins)
    let count = 0
    const cursor = new Date()
    if (!saved.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1)
    while (saved.has(cursor.toISOString().slice(0, 10))) { count++; cursor.setDate(cursor.getDate() - 1) }
    return count
  }, [checkins])

  const level = Math.max(1, Math.floor((user?.points || 0) / 100) + 1)
  const character = level >= 10 ? '네트워크 마스터' : level >= 5 ? '연결 탐험가' : '새싹 품앗이'

  async function createPost(event: React.FormEvent) {
    event.preventDefault()
    if (!user || title.trim().length < 2 || content.trim().length < 2) return
    const { error } = await supabase.from('community_posts').insert({ author_id: user.id, world, title: title.trim(), content: content.trim() })
    if (error) { setMessage('게시판 준비가 필요해요. 관리자에게 DB 확장 SQL 실행을 요청해 주세요.'); return }
    setTitle(''); setContent(''); setMessage('새 이야기가 등록됐어요!'); load()
  }

  async function checkIn() {
    if (!user || checkedToday) return
    const today = new Date().toISOString().slice(0, 10)
    const { error } = await supabase.from('checkins').insert({ user_id: user.id, checked_on: today })
    if (error) { setMessage('출석 기능을 준비 중이에요. DB 확장 설정을 확인해 주세요.'); return }
    setCheckedToday(true); setCheckins(current => [today, ...current]); setMessage('오늘의 연결 도장을 찍었어요!')
  }

  async function report(post: Post) {
    if (!user) return
    const reason = window.prompt('신고 이유를 간단히 적어주세요.')
    if (!reason?.trim()) return
    const { error } = await supabase.from('reports').insert({ reporter_id: user.id, target_type: 'post', target_id: post.id, reason: reason.trim() })
    setMessage(error ? '이미 신고했거나 신고 기능을 준비 중이에요.' : '신고가 접수됐어요. 운영자가 확인할게요.')
  }

  async function block(authorId: string) {
    if (!user || authorId === user.id || !window.confirm('이 사용자의 글을 더 이상 보지 않을까요?')) return
    const { error } = await supabase.from('blocks').insert({ blocker_id: user.id, blocked_id: authorId })
    if (error) { setMessage('이미 차단했거나 차단 기능을 준비 중이에요.'); return }
    setBlockedIds(current => new Set([...current, authorId])); setMessage('사용자를 차단했어요.')
  }

  const visible = posts.filter(post => post.world === world && !blockedIds.has(post.author_id))

  return <div className={styles.page}>
    <Link href="/dashboard" className="back-btn">← 대시보드로 돌아가기</Link>
    <section className={styles.hero}>
      <div><span>COMMUNITY PLAZA</span><h1>네 개의 월드가 만나는<br />서로 광장</h1><p>경험, 콘텐츠, 협업, 농장의 이야기를 나누고 함께할 사람을 찾아보세요.</p></div>
      <aside><b>Lv.{level} · {character}</b><strong>{streak}일 연속 연결 중</strong><button onClick={checkIn} disabled={checkedToday}>{checkedToday ? '✓ 오늘 출석 완료' : '오늘의 도장 찍기'}</button></aside>
    </section>

    <nav className={styles.worlds} aria-label="월드 선택">{WORLDS.map(item => <button key={item.id} className={world === item.id ? styles.active : ''} onClick={() => setWorld(item.id)}><span>{item.icon}</span><b>{item.name}</b><small>{item.guide}가 안내해요</small></button>)}</nav>

    <div className={styles.grid}>
      <form className={styles.composer} onSubmit={createPost}><span>{WORLDS.find(item => item.id === world)?.name}에 이야기 남기기</span><input value={title} onChange={e => setTitle(e.target.value)} maxLength={100} placeholder="함께 나누고 싶은 제목" /><textarea value={content} onChange={e => setContent(e.target.value)} maxLength={2000} placeholder="정보, 질문, 파트너 모집 내용을 적어주세요" /><button>이야기 올리기 ↗</button>{message && <p>{message}</p>}</form>
      <section className={styles.feed}><header><div><span>LIVE STORIES</span><h2>{WORLDS.find(item => item.id === world)?.name} 이야기</h2></div><b>{visible.length}개</b></header>{visible.length === 0 ? <div className={styles.empty}>첫 이야기를 남겨 이 월드를 깨워주세요.</div> : visible.map(post => <article key={post.id}><div><span>{post.users?.nickname || '서로 멤버'}</span><time>{new Date(post.created_at).toLocaleDateString('ko-KR')}</time></div><h3>{post.title}</h3><p>{post.content}</p><footer>{post.author_id === user?.id ? <button onClick={async () => { await supabase.from('community_posts').delete().eq('id', post.id); load() }}>삭제</button> : <><button onClick={() => block(post.author_id)}>차단</button><button onClick={() => report(post)}>신고</button></>}</footer></article>)}</section>
    </div>
  </div>
}
