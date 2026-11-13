import express from "express";
import authenticate from "../middleware/authenticate.js";
import { getActions, patchAction, postAction, removeAction } from "../controllers/actions.controller.js";

const router = express.Router();
router.get("/applications/:id/actions", authenticate, getActions);
router.post("/applications/:id/actions", authenticate, postAction);
router.patch("/applications/:id/actions/:actionId", authenticate, patchAction);
router.delete("/applications/:id/actions/:actionId", authenticate, removeAction);
export default router;
