import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CrumbsProvider } from './crumbs';

const KEY = 'kt.sidebar.collapsed';

/** โครงหน้าหลักของทีมแพทย์และพยาบาล: sidebar (พับได้) + topbar + เนื้อหา
 *  ใช้ animation ขาเข้าอย่างเดียว (ไม่รอ animation ขาออก) เพื่อไม่ให้หน้าค้างว่างเมื่อกดเปลี่ยนหน้าเร็ว ๆ */
export function AppShell() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(KEY) === '1';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(KEY, collapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [collapsed]);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <CrumbsProvider>
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar collapsed={collapsed} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex flex-col gap-6 p-8"
          >
            <Outlet />
          </motion.main>
        </div>
      </div>
    </CrumbsProvider>
  );
}
