import type { ArticleDto } from '@/types';

const d = (days: number) => {
  const t = new Date();
  t.setDate(t.getDate() - days);
  return t.toISOString().slice(0, 10);
};

/** บทความตัวอย่าง (เนื้อหาต้องให้ทีมแพทย์ตรวจก่อนใช้จริง) */
export const articlesDb: ArticleDto[] = [
  { id: 'a1', title: 'ใช้ชีวิตปกติได้กับไตข้างเดียว', category: 'ทั่วไป', readMin: 3, audience: ['donor'], phase: 'postop', sex: 'all', featured: true, status: 'published', cover: 'cover-one-kidney.png', content: 'หลังบริจาคไต ไตข้างที่เหลือจะทำงานเพิ่มขึ้นเพื่อชดเชย ผู้บริจาคส่วนใหญ่ใช้ชีวิตได้ตามปกติ ทำงาน ออกกำลังกาย และเดินทางได้เหมือนเดิม\n\nสิ่งสำคัญคือการดูแลความดันโลหิต ลดอาหารเค็ม ดื่มน้ำให้เพียงพอ และมาตรวจตามนัดทุกปี', todos: ['วัดความดันอย่างน้อยสัปดาห์ละ 1 ครั้ง', 'ลดอาหารเค็ม ไม่เกิน 1 ช้อนชา/วัน', 'มาตรวจติดตามประจำปีตลอดชีวิต'], updatedAt: d(3), updatedBy: 'พย.วิภา สุขใจ' },
  { id: 'a2', title: 'การดูแลแผลหลังผ่าตัด', category: 'หลังผ่าตัด', readMin: 4, audience: ['recipient', 'donor'], phase: 'postop', sex: 'all', featured: false, status: 'published', content: 'ช่วง 2 สัปดาห์แรกหลังผ่าตัด ควรรักษาแผลให้แห้งและสะอาด…', todos: ['สังเกตอาการบวม แดง มีหนอง', 'ห้ามยกของหนักเกิน 5 กิโลกรัม 6 สัปดาห์'], updatedAt: d(8), updatedBy: 'พย.สมใจ รักดี' },
  { id: 'a3', title: 'การกินยากดภูมิให้ถูกเวลา', category: 'ยา', readMin: 3, audience: ['recipient'], phase: 'postop', sex: 'all', featured: true, status: 'published', content: 'ยากดภูมิคุ้มกันต้องกินตรงเวลาทุกวัน เพื่อให้ระดับยาในเลือดคงที่…', todos: ['กินยาเวลาเดิมทุกวัน', 'ห้ามหยุดยาเอง'], updatedAt: d(15), updatedBy: 'นพ.สมเกียรติ วงศ์ไทย' },
  { id: 'a4', title: 'อาหารลดเค็มสำหรับผู้มีไตข้างเดียว', category: 'อาหาร', readMin: 5, audience: ['donor'], phase: 'all', sex: 'all', featured: false, status: 'published', content: 'อาหารรสจัดโดยเฉพาะรสเค็ม ทำให้ความดันโลหิตสูงขึ้น…', todos: ['อ่านฉลากโซเดียมก่อนซื้อ'], updatedAt: d(21), updatedBy: 'พย.วิภา สุขใจ' },
  { id: 'a5', title: 'การตั้งครรภ์หลังบริจาคไต', category: 'ทั่วไป', readMin: 4, audience: ['donor'], phase: 'postop', sex: 'female', featured: false, status: 'draft', content: 'ผู้บริจาคไตหญิงสามารถตั้งครรภ์ได้ แต่ควรปรึกษาแพทย์ก่อน…', todos: [], updatedAt: d(1), updatedBy: 'พย.วิภา สุขใจ' },
  { id: 'a6', title: 'ออกกำลังกายหลังปลูกถ่ายไต', category: 'ออกกำลังกาย', readMin: 3, audience: ['recipient'], phase: 'postop', sex: 'all', featured: false, status: 'draft', content: 'เริ่มจากการเดินเบา ๆ วันละ 15–20 นาที…', todos: [], updatedAt: d(2), updatedBy: 'พย.สมใจ รักดี' },
];

export const ARTICLE_CATEGORIES = ['ทั่วไป', 'หลังผ่าตัด', 'ยา', 'อาหาร', 'ออกกำลังกาย', 'ความดัน'];
