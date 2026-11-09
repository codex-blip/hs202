/** Source/citation service — mock behind a future /api/sources contract. */
import type { SourceCitation } from '../types/api';
import { API_CONFIG, delay, get } from './client';
import { citations } from '../mock/data';

export const sourceService = {
  async listSources(): Promise<SourceCitation[]> {
    if (!API_CONFIG.useMock) {
      return get<SourceCitation[]>('/sources');
    }
    await delay(200);
    return Object.values(citations);
  },
};
