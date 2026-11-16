import { SuccessDialog } from '@/components/brand/BuddyStates';
import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, Eye, FileText, Image as ImageIcon, Pencil, Plus, Save, Send, Star, Trash2, Upload, X } from 'lucide-react';
import type { ArticleAudience, ArticleDto, ArticlePhase, ArticleSex } from '@/types';
import { useCrumbs } from '@/components/layout/crumbs';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge, TONES } from '@/components/ui/Badge';
import { Card, CardHeader } from '@/components/ui/Card';
import { Field, Select, TextInput, Textarea } from '@/components/ui/Form';
import { Skeleton } from '@/components/ui/Skeleton';
import { articleApi } from '@/services/api/articleApi';
import { ARTICLE_CATEGORIES } from '@/mocks/articles';
import { cn, thaiDate } from '@/lib/format';

const empty = (): ArticleDto => ({ id: '', title: '', category: ARTICLE_CATEGORIES[0], readMin: 3, audience: ['recipient'], phase: 'all', sex: 'all', featured: false, status: 'draft', content: '', todos: [], updatedAt: '', updatedBy: '' });

function Chips<T extends string>({ items, value, onToggle }: { items: [T, string][]; value: T[]; onToggle: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(([v, l]) => {
        const on = value.includes(v);
        return (
          <button key={v} type="button" onClick={() => onToggle(v)} className={cn('flex h-[34px] items-center gap-1.5 rounded-full border px-3 text-[13px]', on ? 'border-primary bg-blue-50 font-semibold text-blue-700' : 'border-slate-300 text-slate-700 hover:border-slate-400')}>
            {on && <Check className="h-3.5 w-3.5" strokeWidth={2.6} />}
            {l}
          </button>
        );
      })}
    </div>
  );
}

export default function ArticleEditor() {
  const { id = 'new' } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const [a, setA] = useState<ArticleDto | null>(isNew ? empty() : null);
  const [saving, setSaving] = useState<'' | 'draft' | 'published'>('');
  const [toast, setToast] = useState('');
  const [published, setPublished] = useState(false);
  const [newTodo, setNewTodo] = useState('');
  useCrumbs(['บทความความรู้', isNew ? 'เขียนบทความ' : a?.title || '…']);
  useEffect(() => {
    if (!isNew) articleApi.get(id).then((x) => setA(x ?? empty()));
  }, [id, isNew]);
  if (!a) return <Skeleton className="h-[600px] rounded-2xl" />;
  const patch = (p: Partial<ArticleDto>) => setA({ ...a, ...p });
  const toggleAud = (v: ArticleAudience) => patch({ audience: a.audience.includes(v) ? a.audience.filter((x) => x !== v) : [...a.audience, v] });
  const valid = a.title.trim() && a.audience.length > 0 && a.content.trim();

  async function save(status: 'draft' | 'published') {
    if (!a) return;
    setSaving(status);
    const v = await articleApi.save({ ...a, status });
    setSaving('');
    setA(v);
    if (status === 'published') setPublished(true);
    else {
      setToast('บันทึกร่างแล้ว');
      setTimeout(() => setToast(''), 2200);
    }
    if (isNew) navigate(`/clinical/articles/${v.id}`, { replace: true });
  }
  async function remove() {
    if (!a?.id) return;
    await articleApi.remove(a.id);
    navigate('/clinical/articles');
  }

  return (
    <>
      <PageHeader
        leading={<Button variant="secondary" icon={ArrowLeft} to="/clinical/articles" className="!w-10 !px-0" />}
        title={isNew ? 'เขียนบทความ' : 'แก้ไขบทความ'}
        subtitle={a.updatedAt ? `แก้ไขล่าสุด ${thaiDate(a.updatedAt)} · ${a.updatedBy}` : 'บทความใหม่'}
        actions={
          <>
            {!isNew && (
              <Button variant="ghost" icon={Trash2} onClick={remove}>
                ลบ
              </Button>
            )}
            <Button variant="secondary" icon={Save} disabled={!a.title.trim() || !!saving} onClick={() => save('draft')}>
              {saving === 'draft' ? 'กำลังบันทึก…' : 'บันทึกร่าง'}
            </Button>
            <Button icon={Send} disabled={!valid || !!saving} onClick={() => save('published')}>
              {saving === 'published' ? 'กำลังเผยแพร่…' : a.status === 'published' ? 'อัปเดตบทความ' : 'เผยแพร่'}
            </Button>
          </>
        }
      />
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <Card className="flex flex-col gap-4 p-5">
            <CardHeader title="ข้อมูลบทความ" icon={FileText} />
            <Field label="ชื่อบทความ" required>
              <TextInput value={a.title} onChange={(e) => patch({ title: e.target.value })} placeholder="เช่น การดูแลแผลหลังผ่าตัด" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="หมวด" required>
                <Select value={a.category} onChange={(e) => patch({ category: e.target.value })}>
                  {ARTICLE_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </Field>
              <Field label="เวลาอ่าน (โดยประมาณ)">
                <TextInput inputMode="numeric" suffix="นาที" value={String(a.readMin)} onChange={(e) => patch({ readMin: Number(e.target.value.replace(/\D/g, '')) || 1 })} />
              </Field>
            </div>
          </Card>
          <Card className="flex flex-col gap-4 p-5">
            <CardHeader title="ภาพปก" subtitle="แสดงในการ์ดบทความและแบนเนอร์ · แนะนำ 1200×630" icon={ImageIcon} />
            <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 hover:bg-blue-50/50">
              <span className="grid h-20 w-32 place-items-center rounded-lg bg-blue-100 text-primary">
                <ImageIcon className="h-7 w-7" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">{a.cover ?? 'ยังไม่มีภาพปก'}</span>
                <span className="block text-xs text-slate-400">PNG / JPG</span>
              </span>
              <span className="flex items-center gap-2 rounded-[10px] border border-slate-300 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-700">
                <Upload className="h-4 w-4" /> {a.cover ? 'เปลี่ยนภาพ' : 'เลือกภาพ'}
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => patch({ cover: e.target.files?.[0]?.name })} />
            </label>
          </Card>
          <Card className="flex flex-col gap-4 p-5">
            <CardHeader title="เนื้อหา" icon={Pencil} subtitle="เว้นบรรทัดว่างเพื่อขึ้นย่อหน้าใหม่" />
            <Textarea className="!min-h-[220px] leading-7" value={a.content} onChange={(e) => patch({ content: e.target.value })} placeholder="เขียนเนื้อหาบทความ…" />
          </Card>
          <Card className="flex flex-col gap-3 p-5">
            <CardHeader title="กล่อง “สิ่งที่ต้องทำ”" subtitle="แสดงเป็นกรอบสรุปท้ายบทความ" icon={Check} iconTone={{ fg: '#15803d', bg: '#dcfce7' }} />
            <AnimatePresence initial={false}>
              {a.todos.map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2.5 rounded-[10px] border border-slate-200 px-3 py-2">
                  <Check className="h-4 w-4 text-green-600" strokeWidth={2.5} />
                  <input value={t} onChange={(e) => patch({ todos: a.todos.map((x, j) => (j === i ? e.target.value : x)) })} className="flex-1 bg-transparent text-sm outline-none" />
                  <button type="button" onClick={() => patch({ todos: a.todos.filter((_, j) => j !== i) })} className="text-slate-400 hover:text-slate-600" aria-label="ลบ">
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="flex gap-2">
              <TextInput value={newTodo} onChange={(e) => setNewTodo(e.target.value)} placeholder="เพิ่มรายการ…" onKeyDown={(e) => { if (e.key === 'Enter' && newTodo.trim()) { patch({ todos: [...a.todos, newTodo.trim()] }); setNewTodo(''); } }} />
              <Button variant="secondary" icon={Plus} disabled={!newTodo.trim()} onClick={() => { patch({ todos: [...a.todos, newTodo.trim()] }); setNewTodo(''); }}>
                เพิ่ม
              </Button>
            </div>
          </Card>
        </div>

        <div className="flex w-full flex-col gap-5 xl:w-[360px]">
          <Card className="flex flex-col gap-4 p-5">
            <CardHeader title="การเผยแพร่" icon={Send} />
            <Group label="กลุ่มผู้อ่าน" req>
              <Chips<ArticleAudience> items={[['recipient', 'ผู้รับ'], ['donor', 'ผู้บริจาค']]} value={a.audience} onToggle={toggleAud} />
            </Group>
            <Group label="ช่วงการรักษา">
              <Chips<ArticlePhase> items={[['all', 'ทุกช่วง'], ['preop', 'ก่อนผ่าตัด'], ['postop', 'หลังผ่าตัด']]} value={[a.phase]} onToggle={(v) => patch({ phase: v })} />
            </Group>
            <Group label="เพศ">
              <Chips<ArticleSex> items={[['all', 'ทุกเพศ'], ['female', 'เฉพาะหญิง'], ['male', 'เฉพาะชาย']]} value={[a.sex]} onToggle={(v) => patch({ sex: v })} />
            </Group>
            <button type="button" onClick={() => patch({ featured: !a.featured })} className="flex items-center gap-3 rounded-xl bg-amber-50 p-3 text-left">
              <Star className="h-[18px] w-[18px] text-amber-500" />
              <span className="flex-1">
                <span className="block text-[13.5px] font-semibold">แบนเนอร์แนะนำ</span>
                <span className="block text-xs text-slate-500">แสดงบนสุดของหน้าความรู้</span>
              </span>
              <span className={cn('flex h-6 w-11 items-center rounded-full p-0.5 transition-colors', a.featured ? 'justify-end bg-primary' : 'justify-start bg-slate-300')}>
                <motion.span layout className="h-5 w-5 rounded-full bg-white" />
              </span>
            </button>
            <div className="flex items-center text-[13px] text-slate-500">
              สถานะ
              <span className="flex-1" />
              {a.status === 'published' ? <Badge label="เผยแพร่" tone={TONES.green} dot /> : <Badge label="ร่าง" tone={TONES.amber} dot />}
            </div>
          </Card>
          <Card className="flex flex-col gap-3 p-5">
            <CardHeader title="Preview บนมือถือ" subtitle="หน้าอ่านบทความใน LINE OA" icon={Eye} />
            <div className="mx-auto w-[300px] rounded-[34px] bg-slate-900 p-2">
              <div className="overflow-hidden rounded-[28px] bg-[#f5f7fb]">
                <div className="bg-gradient-to-br from-blue-200 to-blue-300 px-5 pb-7 pt-6">
                  <p className="text-[11px] text-white">ความรู้ · อ่าน {a.readMin} นาที</p>
                  <p className="text-[19px] font-bold leading-6 text-white">{a.title || 'ชื่อบทความ'}</p>
                </div>
                <div className="-mt-3 px-3 pb-4">
                  <div className="flex flex-col gap-2.5 rounded-2xl bg-white p-3.5 shadow-sm">
                    {(a.content || 'เนื้อหาบทความ…').split(/\n\s*\n/).slice(0, 2).map((p, i) => (
                      <p key={i} className="line-clamp-4 text-xs leading-5 text-slate-700">
                        {p}
                      </p>
                    ))}
                    {a.todos.length > 0 && (
                      <div className="flex flex-col gap-1.5 rounded-xl bg-blue-50 p-2.5">
                        <p className="text-xs font-bold text-blue-900">สิ่งที่ต้องทำ</p>
                        {a.todos.map((t, i) => (
                          <p key={i} className="flex items-center gap-1.5 text-[11.5px]">
                            <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-primary">
                              <Check className="h-2 w-2 text-white" strokeWidth={4} />
                            </span>
                            {t}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <SuccessDialog open={published} onClose={() => setPublished(false)} title="เผยแพร่บทความแล้ว" desc="บทความแสดงในหน้า “ความรู้” ของ LINE OA ตามกลุ่มผู้อ่านที่เลือก" actions={<><Button variant="secondary" onClick={() => setPublished(false)}>ปิด</Button><Button to="/clinical/articles">กลับไปรายการบทความ</Button></>} />
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-pop">
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Group({ label, req, children }: { label: string; req?: boolean; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-medium text-slate-700">
        {label} {req && <b className="text-red-600">*</b>}
      </span>
      {children}
    </div>
  );
}
