// GET /api/biz-search?q=강릉 펜션
// 공개 API(카카오 로컬 + 네이버 지역검색)로 업체 공개정보를 모아 병합·중복제거해서 반환.
// ★키는 Vercel 환경변수(KAKAO_KEY / NAVER_ID / NAVER_SECRET)에만 둔다 — 화면엔 안 나감.
// ※ 사업체 공개 영업정보만. 개인 식별정보 수집·영업은 하지 않는다.

const clean = (s) => (s || '').toString().replace(/\s+/g, ' ').trim();

function normalizePhone(p) {
  if (!p) return '';
  const d = String(p).replace(/[^0-9]/g, '');
  if (d.length < 8) return d;
  if (d.startsWith('02')) return d.replace(/^(02)(\d{3,4})(\d{4})$/, '$1-$2-$3');
  return d.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3');
}

function makeRecord(o) {
  return {
    name: clean(o.name),
    category: clean(o.category),
    address: clean(o.roadAddress || o.address),
    phone: normalizePhone(o.phone),
    lat: o.lat != null && o.lat !== '' ? Number(o.lat) : null,
    lng: o.lng != null && o.lng !== '' ? Number(o.lng) : null,
    status: clean(o.status),
    source: o.source,
  };
}

const dedupeKey = (r) => (r.phone ? 'tel:' + r.phone.replace(/-/g, '') : (r.name + r.address).replace(/\s/g, '') ? 'na:' + (r.name + r.address).replace(/\s/g, '') : '');

async function searchKakao(query, key, maxPages = 3) {
  if (!key) return { source: 'kakao', ok: false, reason: '카카오 키 미설정', records: [] };
  const out = [];
  for (let page = 1; page <= maxPages; page++) {
    const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=15&page=${page}`;
    let res;
    try { res = await fetch(url, { headers: { Authorization: `KakaoAK ${key}` } }); }
    catch (e) { return { source: 'kakao', ok: false, reason: '네트워크 오류', records: out }; }
    if (!res.ok) return { source: 'kakao', ok: false, reason: `HTTP ${res.status}`, records: out };
    const data = await res.json();
    for (const d of data.documents || []) {
      out.push(makeRecord({ name: d.place_name, category: d.category_name, roadAddress: d.road_address_name, address: d.address_name, phone: d.phone, lat: d.y, lng: d.x, source: 'kakao' }));
    }
    if (data.meta?.is_end) break;
  }
  return { source: 'kakao', ok: true, records: out };
}

async function searchNaver(query, id, secret) {
  if (!id || !secret) return { source: 'naver', ok: false, reason: '네이버 키 미설정', records: [] };
  const url = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=5&sort=random`;
  let res;
  try { res = await fetch(url, { headers: { 'X-Naver-Client-Id': id, 'X-Naver-Client-Secret': secret } }); }
  catch (e) { return { source: 'naver', ok: false, reason: '네트워크 오류', records: [] }; }
  if (!res.ok) return { source: 'naver', ok: false, reason: `HTTP ${res.status}`, records: [] };
  const data = await res.json();
  const records = (data.items || []).map((it) => makeRecord({ name: (it.title || '').replace(/<[^>]+>/g, ''), category: it.category, roadAddress: it.roadAddress, address: it.address, phone: it.telephone, source: 'naver' }));
  return { source: 'naver', ok: true, records };
}

export default async function handler(req, res) {
  const q = clean(req.query?.q);
  if (!q) return res.status(400).json({ error: '검색어(지역 + 업종)를 입력하세요. 예: 강릉 펜션' });

  const results = await Promise.allSettled([
    searchKakao(q, process.env.KAKAO_KEY),
    searchNaver(q, process.env.NAVER_ID, process.env.NAVER_SECRET),
  ]);

  const sources = [];
  let all = [];
  for (const r of results) {
    if (r.status === 'fulfilled') {
      sources.push({ source: r.value.source, ok: r.value.ok, reason: r.value.reason || null, count: r.value.records.length });
      all = all.concat(r.value.records);
    }
  }

  const seen = new Map();
  for (const rec of all) {
    const k = dedupeKey(rec);
    if (!k) continue;
    if (!seen.has(k)) { seen.set(k, rec); continue; }
    const ex = seen.get(k);
    seen.set(k, { ...ex, phone: ex.phone || rec.phone, lat: ex.lat ?? rec.lat, lng: ex.lng ?? rec.lng, status: ex.status || rec.status, source: ex.source === rec.source ? ex.source : `${ex.source}+${rec.source}` });
  }

  res.status(200).json({ query: q, sources, records: [...seen.values()] });
}
