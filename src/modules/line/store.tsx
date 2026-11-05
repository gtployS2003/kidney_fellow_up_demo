import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { PERSONAS, fullName, type Persona, type PersonaKey } from './personas';
import { buildNotify, type FlexData, type LiffPage } from './notify';

export type Msg =
  | { id: string; from: 'bot' | 'user'; type: 'text'; text: string; time: string }
  | { id: string; from: 'bot'; type: 'flex'; data: FlexData; time: string; answered?: string }
  | { id: string; type: 'date'; text: string };
export interface LogEvent {
  time: string;
  who: string;
  text: string;
}

const now = () => new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
const uid = () => Math.random().toString(36).slice(2);
const today = () => new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'short' });

const welcomeGuest = (): Msg[] => [
  { id: uid(), type: 'date', text: today() },
  { id: uid(), from: 'bot', type: 'text', text: 'สวัสดีค่ะ 🙏 ยินดีต้อนรับสู่ LINE ศูนย์ปลูกถ่ายไต โรงพยาบาลมหาวิทยาลัยนเรศวร', time: now() },
  { id: uid(), from: 'bot', type: 'text', text: 'กรุณากด “ลงทะเบียน” ด้านล่าง เพื่อยืนยันตัวตนด้วย ThaiD และเชื่อมต่อ LINE ค่ะ', time: now() },
];
const welcomeLinked = (p: Persona): Msg[] => [
  { id: uid(), type: 'date', text: today() },
  { id: uid(), from: 'bot', type: 'text', text: `เชื่อมต่อสำเร็จ ✅ ${fullName(p)} (${p.kind === 'donor' ? 'ผู้บริจาคไต' : 'ผู้รับไต'})\nเมนูด้านล่างเปลี่ยนเป็นเมนูสำหรับ${p.kind === 'donor' ? 'ผู้บริจาคไต' : 'ผู้รับไต'}แล้วค่ะ`, time: now() },
];

interface Ctx {
  active: PersonaKey;
  persona?: Persona;
  messages: Msg[];
  liff: { page: LiffPage; tab?: string } | null;
  log: LogEvent[];
  setActive: (k: PersonaKey) => void;
  openLiff: (page: LiffPage, tab?: string) => void;
  closeLiff: () => void;
  sendNotify: (no: number, extra?: { sys: number; dia: number }) => void;
  pressButton: (msgId: string, btnIdx: number) => void;
  sendUserText: (t: string) => void;
  registered: (k: Exclude<PersonaKey, 'guest'>) => void;
  record: (text: string) => void;
  reset: () => void;
  medsTaken: Record<string, boolean>;
  toggleMed: (key: string) => void;
}
const C = createContext<Ctx | null>(null);
export const useSim = () => useContext(C)!;

/** สถานะของ LINE OA จำลอง (แชท · rich menu · LIFF) — ไม่ได้เชื่อม LINE จริง */
export function SimProvider({ children }: { children: ReactNode }) {
  const [active, setActiveRaw] = useState<PersonaKey>('guest');
  const [chats, setChats] = useState<Record<PersonaKey, Msg[]>>(() => ({ guest: welcomeGuest(), 'r-pre': welcomeLinked(PERSONAS['r-pre']), 'r-post': welcomeLinked(PERSONAS['r-post']), 'd-post': welcomeLinked(PERSONAS['d-post']) }));
  const [liff, setLiff] = useState<Ctx['liff']>(null);
  const [log, setLog] = useState<LogEvent[]>([]);
  const [medsTaken, setMedsTaken] = useState<Record<string, boolean>>({ 'am-0': true, 'am-1': true, 'am-2': true });
  const activeRef = useRef(active);
  activeRef.current = active;
  const persona = active === 'guest' ? undefined : PERSONAS[active];

  const push = useCallback((k: PersonaKey, m: Msg) => setChats((c) => ({ ...c, [k]: [...c[k], m] })), []);
  const record = useCallback((text: string) => {
    const k = activeRef.current;
    setLog((l) => [{ time: now(), who: k === 'guest' ? 'ผู้ใช้ใหม่' : fullName(PERSONAS[k]), text }, ...l].slice(0, 30));
  }, []);

  const value: Ctx = useMemo(
    () => ({
      active,
      persona,
      messages: chats[active],
      liff,
      log,
      medsTaken,
      setActive: (k) => {
        setLiff(null);
        setActiveRaw(k);
      },
      openLiff: (page, tab) => setLiff({ page, tab }),
      closeLiff: () => setLiff(null),
      sendNotify: (no, extra) => {
        if (!persona) return;
        push(active, { id: uid(), from: 'bot', type: 'flex', data: buildNotify(no, persona, extra), time: now() });
      },
      pressButton: (msgId, i) => {
        const m = chats[active].find((x) => x.id === msgId);
        if (!m || m.type !== 'flex') return;
        const b = m.data.buttons[i];
        if (b.action.type === 'open') {
          setLiff({ page: b.action.page, tab: b.action.tab });
          return;
        }
        const text = b.action.type === 'snooze' ? 'เตือนอีก 15 นาที' : b.action.text;
        setChats((c) => ({ ...c, [active]: c[active].map((x) => (x.id === msgId && x.type === 'flex' ? { ...x, answered: text } : x)) }));
        push(active, { id: uid(), from: 'user', type: 'text', text, time: now() });
        record(`ตอบ “${text}” · ${m.data.kicker} → บันทึกลง Timeline`);
        if (b.action.type === 'snooze') {
          setTimeout(() => push(activeRef.current, { id: uid(), from: 'bot', type: 'text', text: 'รับทราบค่ะ จะเตือนอีกครั้งใน 15 นาที ⏰', time: now() }), 600);
          if (persona) setTimeout(() => push(activeRef.current, { id: uid(), from: 'bot', type: 'flex', data: buildNotify(6, persona), time: now() }), 4000);
        }
      },
      sendUserText: (t) => {
        push(active, { id: uid(), from: 'user', type: 'text', text: t, time: now() });
        setTimeout(() => push(activeRef.current, { id: uid(), from: 'bot', type: 'text', text: 'ขออภัยค่ะ ช่องทางนี้ใช้สำหรับแจ้งเตือนและเมนูด้านล่างเท่านั้น ไม่รองรับการสนทนา\nหากมีอาการผิดปกติ กรุณาโทร 055-96-xxxx (จ.–ศ. 08:00–16:00)', time: now() }), 700);
      },
      registered: (k) => {
        setLiff(null);
        setChats((c) => ({ ...c, [k]: [...c.guest, ...welcomeLinked(PERSONAS[k]).slice(1)], guest: welcomeGuest() }));
        setActiveRaw(k);
        setLog((l) => [{ time: now(), who: fullName(PERSONAS[k]), text: 'ยืนยันตัวตน (ThaiD จำลอง) → ผูก LINE userId + เปลี่ยน Rich menu' }, ...l]);
      },
      record,
      reset: () => {
        setChats((c) => ({ ...c, [active]: active === 'guest' ? welcomeGuest() : welcomeLinked(PERSONAS[active]) }));
        setLiff(null);
      },
      toggleMed: (key) => {
        setMedsTaken((m) => ({ ...m, [key]: !m[key] }));
      },
    }),
    [active, persona, chats, liff, log, medsTaken, push, record],
  );
  return <C.Provider value={value}>{children}</C.Provider>;
}
