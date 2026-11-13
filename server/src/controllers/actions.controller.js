import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { idSchema } from "../schemas/id.schema.js";
import { actionSchema, actionPatchSchema } from "../schemas/action.schema.js";
import { createAction, deleteAction, listActions, updateAction } from "../services/actions.service.js";

const parseId = (value, label) => {
    const parsed = idSchema.safeParse(value);
    if (!parsed.success) throw new AppError(`Invalid ${label} ID`, 400);
    return parsed.data;
};

export const getActions = asyncHandler(async (req, res) => {
    const data = await listActions(req.user.id, parseId(req.params.id, "application"));
    res.json({ success: true, count: data.length, data });
});
export const postAction = asyncHandler(async (req, res) => {
    const parsed = actionSchema.safeParse(req.body);
    if (!parsed.success) throw parsed.error;
    const data = await createAction(req.user.id, parseId(req.params.id, "application"), parsed.data);
    res.status(201).json({ success: true, data });
});
export const patchAction = asyncHandler(async (req, res) => {
    const parsed = actionPatchSchema.safeParse(req.body);
    if (!parsed.success) throw parsed.error;
    const data = await updateAction(req.user.id, parseId(req.params.id, "application"), parseId(req.params.actionId, "action"), parsed.data);
    res.json({ success: true, data });
});
export const removeAction = asyncHandler(async (req, res) => {
    await deleteAction(req.user.id, parseId(req.params.id, "application"), parseId(req.params.actionId, "action"));
    res.status(204).send();
});
