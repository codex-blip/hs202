/** Grievance navigation service — mock behind a future /api/grievances contract. */
import type { GrievanceRoute } from '../types/api';
import { API_CONFIG, delay, get } from './client';
import { grievanceRoutes } from '../mock/data';

export const grievanceService = {
  async listRoutes(): Promise<GrievanceRoute[]> {
    if (!API_CONFIG.useMock) {
      return get<GrievanceRoute[]>('/grievances');
    }
    await delay(300);
    return grievanceRoutes;
  },
};
