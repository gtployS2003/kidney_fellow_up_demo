import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Check, FilePen, FileText, Plus, Search, Star } from 'lucide-react';
import type { ArticleDto } from '@/types';
import { useCrumbs } from '@/components/layout/crumbs';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge, TONES } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Form';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAsync } from '@/hooks/useAsync';
import { articleApi } from '@/services/api/articleApi';
import { ARTICLE_CATEGORIES } from '@/mocks/articles';
import { thaiDate } from '@/lib/format';

export const PHASE_LABEL = { all: 'ทุกช่วง', preop: 'ก่อนผ่าตัด', postop: 'หลังผ่าตัด' } as const;
export const SEX_LABEL = { all: '', female: 'เฉพาะผู้หญิง', male: 'เฉพาะผู้ชาย' } as const;
export const conditionText = (a: ArticleDto) => [PHASE_LABEL[a.phase], SEX_LABEL[a.sex]].filter(Boolean).join(' · ');

export function AudienceBadges({ a }: { a: ArticleDto }) {
  return (
    <span className="flex flex-wrap gap-1">
      {a.audience.includes('recipient') && <Badge label="ผู้รับ" tone={TONES.blue} />}
      {a.audience.includes('donor') && <Badge label="ผู้บริจาค" tone={TONES.teal} />}
    </span>
  );
}

export default function ArticleList() {
  useCrumbs(['บทความความรู้']);
  const navigate = useNavigate();
  const { data, loading } = useAsync(() => articleApi.list(), []);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [aud, setAud] = useState('all');
  const [st, setSt] = useState('all');
  const all = data ?? [];
  const rows = useMemo(() => all.filter((a) => a.title.includes(q.trim()) && (cat === 'all' || a.category === cat) && (aud === 'all' || a.audience.includes(aud as 'recipient' | 'donor')) && (st === 'all' || a.status === st)), [all, q, cat, aud, st]);
  const stats = [
    { icon: FileText, k: 'ทั้งหมด', v: all.length, fg: '#2563eb', bg: '#dbeafe' },
    { icon: Check, k: 'เผยแพร่แล้ว', v: all.filter((a) => a.status === 'published').length, fg: '#15803d', bg: '#dcfce7' },
    { icon: FilePen, k: 'ร่าง', v: all.filter((a) => a.status === 'draft').length, fg: '#a16207', bg: '#fef9c3' },
    { icon: Star, k: 'แบนเนอร์แนะนำ', v: all.filter((a) => a.featured && a.status === 'published').length, fg: '#c2410c', bg: '#ffedd5' },
  ];
  return (
    <>
      <PageHeader title="บทความความรู้" subtitle="บทความที่เผยแพร่จะแสดงในหน้า “ความรู้” ของ LINE OA ตามกลุ่มผู้อ่านและเงื่อนไข" actions={<Button icon={Plus} to="/clinical/articles/new">เขียนบทความ</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.k} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }} className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-5">
            <span className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: s.bg, color: s.fg }}>
              <s.icon className="h-[22px] w-[22px]" />
            </span>
            <span>
              <span className="block text-[26px] font-bold leading-8">{loading ? '…' : s.v}</span>
              <span className="block text-[13px] text-slate-500">{s.k}</span>
            </span>
          </motion.div>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center gap-2.5 p-4">
          <label className="flex h-10 w-[300px] items-center gap-2 rounded-[10px] border border-slate-300 px-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาชื่อบทความ" className="w-full bg-transparent text-[13px] outline-none" />
          </label>
          <Select className="!h-10 !w-auto" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="all">หมวด: ทั้งหมด</option>
            {ARTICLE_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
          <Select className="!h-10 !w-auto" value={aud} onChange={(e) => setAud(e.target.value)}>
            <option value="all">ผู้อ่าน: ทั้งหมด</option>
            <option value="recipient">ผู้รับ</option>
            <option value="donor">ผู้บริจาค</option>
          </Select>
          <Select className="!h-10 !w-auto" value={st} onChange={(e) => setSt(e.target.value)}>
            <option value="all">สถานะ: ทั้งหมด</option>
            <option value="published">เผยแพร่</option>
            <option value="draft">ร่าง</option>
          </Select>
          <span className="flex-1" />
          <span className="text-[13px] text-slate-500">{rows.length} บทความ</span>
        </div>
        {loading ? (
          <Skeleton className="m-4 h-40" />
        ) : rows.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={BookOpen} title="ไม่พบบทความ" />
          </div>
        ) : (
          <table className="w-full text-left text-[13px]">
            <thead className="border-y border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
              <tr>
                {['บทความ', 'หมวด', 'ผู้อ่าน', 'เงื่อนไข', 'สถานะ', 'แก้ไขล่าสุด'].map((h) => (
                  <th key={h} className="px-4 py-2.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} onClick={() => navigate(`/clinical/articles/${a.id}`)} className="cursor-pointer border-b border-slate-100 hover:bg-blue-50/50">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-3">
                      <span className="grid h-10 w-14 place-items-center rounded-lg bg-blue-50 text-primary">
                        <BookOpen className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-primary">{a.title}</span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          {a.featured ? (
                            <>
                              <Star className="h-3 w-3 text-amber-500" /> <span className="text-amber-700">แบนเนอร์แนะนำ</span>
                            </>
                          ) : (
                            `อ่าน ${a.readMin} นาที`
                          )}
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3">{a.category}</td>
                  <td className="px-4 py-3">
                    <AudienceBadges a={a} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">{conditionText(a)}</td>
                  <td className="px-4 py-3">{a.status === 'published' ? <Badge label="เผยแพร่" tone={TONES.green} dot /> : <Badge label="ร่าง" tone={TONES.amber} dot />}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {thaiDate(a.updatedAt)}
                    <span className="block text-xs text-slate-400">{a.updatedBy}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
