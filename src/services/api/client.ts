/**
 * จุดเชื่อมระหว่างหน้าจอ (React) กับ middleware/backend (ASP.NET Core Web API)
 * - VITE_USE_MOCK=true  → ใช้ข้อมูลใน src/mocks (ค่าเริ่มต้นของเดโม)
 * - VITE_USE_MOCK=false → เรียก API จริงที่ VITE_API_BASE (เช่น /api/recipients)
 */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
export const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** หน่วงเวลาเล็กน้อยให้เห็น loading state เหมือนเรียก API จริง */
export function mockDelay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms));
}

export function toQuery(params: Record<string, string | undefined>): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v && v !== 'all') q.set(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}
