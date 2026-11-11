import { useEffect, useRef } from 'react';
import type { AnimationItem } from 'lottie-web';

export type BuddyPose = 'idle' | 'welcome' | 'register' | 'loading' | 'success' | 'not_found' | 'error' | 'notification';

/** โหลดไฟล์ Lottie แบบแยก chunk — ดาวน์โหลดเฉพาะท่าที่ใช้จริง */
const LOADERS: Record<BuddyPose, () => Promise<{ default: unknown }>> = {
  idle: () => import('@/assets/lottie/kidney_idle.json'),
  welcome: () => import('@/assets/lottie/kidney_welcome.json'),
  register: () => import('@/assets/lottie/kidney_register.json'),
  loading: () => import('@/assets/lottie/kidney_loading.json'),
  success: () => import('@/assets/lottie/kidney_success.json'),
  not_found: () => import('@/assets/lottie/kidney_not_found.json'),
  error: () => import('@/assets/lottie/kidney_error.json'),
  notification: () => import('@/assets/lottie/kidney_notification.json'),
};

const LABEL: Record<BuddyPose, string> = {
  idle: 'มาสคอตไตคู่',
  welcome: 'มาสคอตไตคู่โบกมือทักทาย',
  register: 'มาสคอตไตคู่ถือบัตรประชาชนและมือถือ',
  loading: 'กำลังโหลด',
  success: 'สำเร็จ',
  not_found: 'ไม่พบข้อมูล',
  error: 'เกิดข้อผิดพลาด',
  notification: 'มีการแจ้งเตือน',
};

/**
 * Kidney Buddy (Lottie v1.0) · 512×512 · 60 fps
 * - ใช้ lottie-web รุ่น light (เฉพาะ SVG renderer) และโหลดแบบ lazy
 * - ผู้ใช้ที่ตั้ง “ลดการเคลื่อนไหว” จะเห็นเป็นภาพนิ่ง (เฟรม 30)
 */
export function KidneyBuddy({ pose, size = 160, loop = true, className, label }: { pose: BuddyPose; size?: number; loop?: boolean; className?: string; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let anim: AnimationItem | undefined;
    let cancelled = false;
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    Promise.all([import('lottie-web/build/player/lottie_light'), LOADERS[pose]()]).then(([mod, data]) => {
      if (cancelled || !ref.current) return;
      ref.current.innerHTML = '';
      anim = mod.default.loadAnimation({
        container: ref.current,
        renderer: 'svg',
        loop: loop && !reduce,
        autoplay: !reduce,
        animationData: data.default,
        rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
      });
      if (reduce) anim.goToAndStop(30, true);
    });
    return () => {
      cancelled = true;
      anim?.destroy();
    };
  }, [pose, loop]);
  return <div ref={ref} role="img" aria-label={label ?? LABEL[pose]} className={className} style={{ width: size, height: size }} />;
}
