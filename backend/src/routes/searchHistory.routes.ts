import { Router } from "express";
import { getSearchHistoryHandler } from "../controllers/searchHistory.controller";
import { asyncHandler } from "../utils/asyncHandler";

export const searchHistoryRouter = Router();

searchHistoryRouter.get("/", asyncHandler(getSearchHistoryHandler));
