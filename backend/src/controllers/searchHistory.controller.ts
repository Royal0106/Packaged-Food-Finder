import type { Request, Response } from "express";
import { listRecentSearches } from "../services/searchHistory.service";
import { sendSuccess } from "../utils/response";

export async function getSearchHistoryHandler(_req: Request, res: Response) {
  const history = await listRecentSearches();
  return sendSuccess(
    res,
    history.map((item) => ({
      id: item.id,
      query: item.query,
      language: item.language,
      createdAt: item.createdAt.toISOString(),
    })),
  );
}
