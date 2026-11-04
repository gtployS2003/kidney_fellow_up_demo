import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const Ctx = createContext<{ crumbs: string[]; setCrumbs: (c: string[]) => void }>({ crumbs: [], setCrumbs: () => {} });

export function CrumbsProvider({ children }: { children: ReactNode }) {
  const [crumbs, setCrumbs] = useState<string[]>([]);
  return <Ctx.Provider value={{ crumbs, setCrumbs }}>{children}</Ctx.Provider>;
}

export function useCrumbsValue() {
  return useContext(Ctx).crumbs;
}

/** เรียกในแต่ละหน้าเพื่อกำหนด breadcrumb บน Topbar */
export function useCrumbs(crumbs: string[]) {
  const { setCrumbs } = useContext(Ctx);
  const key = crumbs.join('›');
  useEffect(() => {
    setCrumbs(crumbs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, setCrumbs]);
}
