import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import styles from './MissionChat.module.css'

type ChatMessage = { id: string; sender_id: string; body: string; created_at: string; users?: { nickname: string } | null }

export default function MissionChat({ missionId, userId }: { missionId: string; userId: string }) {
  const [items, setItems] = useState<ChatMessage[]>([])
  const [body, setBody] = useState('')
  const [notice, setNotice] = useState('')
  async function load() {
    const { data } = await supabase.from('mission_messages').select('*, users(nickname)').eq('mission_id', missionId).order('created_at').limit(100)
    setItems((data as ChatMessage[]) || [])
  }
  useEffect(() => {
    load()
    const channel = supabase.channel(`mission_chat_${missionId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mission_messages', filter: `mission_id=eq.${missionId}` }, load).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [missionId])
  async function send(event: React.FormEvent) {
    event.preventDefault()
    if (!body.trim()) return
    const { error } = await supabase.from('mission_messages').insert({ mission_id: missionId, sender_id: userId, body: body.trim() })
    if (error) { setNotice('인증 제출 후 요청자와 대화할 수 있어요.'); return }
    setBody(''); setNotice(''); load()
  }
  return <section className={styles.chat}><header><div><span>SAFE CHAT</span><h2>미션 대화방</h2></div><small>개인정보 대신 필요한 내용만 나눠주세요.</small></header><div className={styles.messages}>{items.length === 0 ? <p>아직 대화가 없어요. 궁금한 점을 남겨보세요.</p> : items.map(item => <article key={item.id} className={item.sender_id === userId ? styles.mine : ''}><b>{item.users?.nickname || '참여자'}</b><span>{item.body}</span><time>{new Date(item.created_at).toLocaleString('ko-KR')}</time></article>)}</div><form onSubmit={send}><input value={body} onChange={e => setBody(e.target.value)} maxLength={500} placeholder="미션 관련 질문을 남겨주세요" /><button>보내기</button></form>{notice && <p className={styles.notice}>{notice}</p>}</section>
}
