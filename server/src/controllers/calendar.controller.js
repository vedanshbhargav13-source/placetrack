import asyncHandler from "../utils/asyncHandler.js";
import { createCalendar, getCalendarItems } from "../services/calendar.service.js";

export const exportCalendar = asyncHandler(async (req, res) => {
    const events = await getCalendarItems(req.user.id);
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=placetrack-calendar.ics");
    res.setHeader("Cache-Control", "private, no-store");
    res.send(createCalendar(events));
});
