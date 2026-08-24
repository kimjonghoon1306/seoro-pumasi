import { useEffect, useState } from 'react'
import { Link } from 'wouter'
import { supabase } from '../lib/supabase'
import styles from './NotificationBell.module.css'

type Notice = { id: string; title: string; body: string; link: string | null; read_at: string | null; created_at: string }

export default function NotificationBell({ userId }: { userId: string }) {
  const [items, setItems] = useState<Notice[]>([])
  const [open, setOpen] = useState(false)
  async function load() {
    const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10)
    setItems((data as Notice[]) || [])
  }
  useEffect(() => {
    load()
    const channel = supabase.channel(`notices_${userId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, load).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId])
  const unread = items.filter(item => !item.read_at).length
  async function markAll() {
    await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', userId).is('read_at', null)
    setItems(current => current.map(item => ({ ...item, read_at: item.read_at || new Date().toISOString() })))
  }
  return <div className={styles.wrap}><button className={styles.bell} onClick={() => setOpen(value => !value)} aria-label={`알림 ${unread}개`}>♢{unread > 0 && <i>{unread}</i>}</button>{open && <div className={styles.panel}><header><b>새로운 소식</b><button onClick={markAll}>모두 읽음</button></header>{items.length === 0 ? <p className={styles.empty}>아직 새로운 알림이 없어요.</p> : items.map(item => <Link key={item.id} href={item.link || '/dashboard'} className={!item.read_at ? styles.unread : ''} onClick={() => setOpen(false)}><b>{item.title}</b><span>{item.body}</span><time>{new Date(item.created_at).toLocaleDateString('ko-KR')}</time></Link>)}</div>}</div>
}
