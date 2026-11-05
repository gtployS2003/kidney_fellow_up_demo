import type { ArticleDto } from '@/types';
import { articlesDb } from '@/mocks/articles';
import { USE_MOCK, http, mockDelay } from './client';

/** module “Articles” ฝั่ง backend: /api/articles (ฝั่ง LINE OA อ่านเฉพาะที่เผยแพร่) */
export const articleApi = {
  async list(): Promise<ArticleDto[]> {
    if (!USE_MOCK) return http('/articles');
    return mockDelay([...articlesDb].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  },
  async get(id: string): Promise<ArticleDto | null> {
    if (!USE_MOCK) return http(`/articles/${id}`);
    return mockDelay(articlesDb.find((a) => a.id === id) ?? null);
  },
  async save(a: ArticleDto): Promise<ArticleDto> {
    if (!USE_MOCK) return http(a.id ? `/articles/${a.id}` : '/articles', { method: a.id ? 'PUT' : 'POST', body: JSON.stringify(a) });
    const v = { ...a, id: a.id || `a${Date.now()}`, updatedAt: new Date().toISOString().slice(0, 10), updatedBy: 'นพ.สมเกียรติ วงศ์ไทย' };
    const i = articlesDb.findIndex((x) => x.id === v.id);
    if (i >= 0) articlesDb[i] = v;
    else articlesDb.unshift(v);
    return mockDelay(v, 350);
  },
  async remove(id: string): Promise<void> {
    if (!USE_MOCK) return http(`/articles/${id}`, { method: 'DELETE' });
    const i = articlesDb.findIndex((x) => x.id === id);
    if (i >= 0) articlesDb.splice(i, 1);
    return mockDelay(undefined, 200);
  },
};
