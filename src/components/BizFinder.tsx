import { useState } from 'react'

type Rec = { name: string; category: string; address: string; phone: string; lat: number | null; lng: number | null; status: string; source: string }
type SourceStat = { source: string; ok: boolean; reason: string | null; count: number }

// 관리자 전용 — 지역+업종으로 업체 공개정보(상호·주소·전화·업태)를 모아 CSV로 뽑는다.
export default function BizFinder() {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<Rec[]>([])
  const [sources, setSources] = useState<SourceStat[]>([])
  const [err, setErr] = useState('')
  const [searched, setSearched] = useState(false)

  const search = async () => {
    const query = q.trim()
    if (!query) return
    setLoading(true); setErr(''); setSearched(true)
    try {
      const res = await fetch(`/api/biz-search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (!res.ok) { setErr(data.error || '검색에 실패했어요'); setRecords([]); setSources([]) }
      else { setRecords(data.records || []); setSources(data.sources || []) }
    } catch (e: any) { setErr('네트워크 오류: ' + e.message); setRecords([]); setSources([]) }
    finally { setLoading(false) }
  }

  const downloadCsv = () => {
    const COLS = ['name', 'category', 'address', 'phone', 'status', 'source']
    const H = ['상호', '업태', '주소', '전화', '영업상태', '출처']
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const csv = [H.map(esc).join(','), ...records.map((r) => COLS.map((c) => esc((r as any)[c])).join(','))].join('\r\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${q.trim().replace(/\s+/g, '_')}_${records.length}건.csv`
    a.click()
  }

  const S = {
    wrap: { maxWidth: 820, margin: '0 auto' } as const,
    intro: { color: '#5b6b60', fontSize: 14, lineHeight: 1.6, marginBottom: 16 } as const,
    bar: { display: 'flex', gap: 8, marginBottom: 12 } as const,
    input: { flex: 1, padding: '13px 16px', borderRadius: 12, border: '1.5px solid #cfe3d5', fontSize: 15, outline: 'none' } as const,
    btn: { padding: '13px 22px', borderRadius: 12, border: 'none', background: '#2f9e5e', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', whiteSpace: 'nowrap' } as const,
    chips: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 } as const,
    chip: { padding: '5px 11px', borderRadius: 999, background: '#eef6f0', color: '#3a7a55', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', border: '1px solid #d8ebde' } as const,
    summary: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', margin: '4px 0 14px' } as const,
    dl: { marginLeft: 'auto', padding: '9px 16px', borderRadius: 10, border: '1.5px solid #2f9e5e', background: '#fff', color: '#2f9e5e', fontWeight: 800, fontSize: 13.5, cursor: 'pointer' } as const,
    card: { border: '1px solid #e5efe8', borderRadius: 14, padding: '14px 16px', marginBottom: 10, background: '#fff' } as const,
    name: { fontSize: 16, fontWeight: 800, color: '#1f2d25' } as const,
    tel: { fontSize: 15, fontWeight: 800, color: '#2f9e5e', marginTop: 2 } as const,
    meta: { fontSize: 13, color: '#6b7d70', marginTop: 4, lineHeight: 1.5 } as const,
    tag: (c: string) => ({ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: c + '18', color: c }) as const,
  }

  return (
    <div style={S.wrap}>
      <p style={S.intro}>
        <b>지역 + 업종</b>을 넣으면 공개 정보(상호·주소·전화·업태)를 모아 드려요. 결과는 CSV로 저장돼요.<br />
        <span style={{ fontSize: 12.5, color: '#8aa093' }}>※ 업체 공개 영업정보만 수집합니다. 개인 연락처는 수집하지 않아요.</span>
      </p>

      <div style={S.bar}>
        <input
          style={S.input}
          placeholder="예: 강릉 펜션 / 속초 여행사 / 제주 흑돼지 맛집"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
        />
        <button style={{ ...S.btn, opacity: loading ? 0.6 : 1 }} onClick={search} disabled={loading}>
          {loading ? '검색 중…' : '🔍 검색'}
        </button>
      </div>

      <div style={S.chips}>
        {['강릉 펜션', '속초 여행사', '제주 흑돼지 맛집', '부산 카페', '경주 게스트하우스'].map((ex) => (
          <span key={ex} style={S.chip} onClick={() => { setQ(ex) }}>{ex}</span>
        ))}
      </div>

      {err && <div style={{ padding: 14, borderRadius: 12, background: '#fdecef', color: '#c0335c', fontSize: 14, fontWeight: 600 }}>⚠️ {err}</div>}

      {!err && searched && !loading && (
        <div style={S.summary}>
          <span style={{ fontSize: 13, color: '#6b7d70' }}>
            {sources.map((s) => `${s.source}=${s.ok ? s.count + '건' : '미설정'}`).join(' · ')}
          </span>
          <b style={{ fontSize: 15, color: '#1f2d25' }}>· 총 {records.length}건</b>
          {records.length > 0 && <button style={S.dl} onClick={downloadCsv}>⬇ CSV 다운로드</button>}
        </div>
      )}

      {searched && !loading && !err && records.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8aa093' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔎</div>
          결과가 없어요. 키가 설정됐는지(관리자), 또는 검색어를 바꿔보세요.
        </div>
      )}

      {records.map((r, i) => (
        <div key={i} style={S.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={S.name}>{r.name}</span>
            {r.status && <span style={S.tag(r.status.includes('폐업') ? '#c0335c' : '#2f9e5e')}>{r.status}</span>}
            <span style={{ ...S.tag('#7a8b99'), marginLeft: 'auto' }}>{r.source}</span>
          </div>
          {r.phone && <div style={S.tel}>📞 {r.phone}</div>}
          <div style={S.meta}>
            {r.category && <>🏷 {r.category}<br /></>}
            {r.address && <>📍 {r.address}</>}
          </div>
        </div>
      ))}
    </div>
  )
}
