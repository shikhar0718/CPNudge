import { findUpcoming, findById, findContests } from "./contest.repository.js";
import { ContestSyncService } from "./contest-sync.service.js";
import type { ContestQueryDto } from "./dto/contest-query.dto.js";

import APIError from "../../common/utils/api.erros.js";

export class ContestService {
  private readonly contestSyncService = new ContestSyncService();
  async getUpcomingContests(limit?: number) {
    return findUpcoming(limit);
  }
  async getContests(query: ContestQueryDto) {
    const { total, contests } = await findContests(query);
    const totalPages = Math.ceil(total / query.limit);

    return {
      contests,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    };
  }
  async getContestById(id: string) {
    const contest = await findById(id);

    if (!contest) {
      throw APIError.notFound("Contest not found");
    }
    return contest;
  }
  async syncContests() {
    return this.contestSyncService.syncContests();
  }
}

export const contestService = new ContestService();
