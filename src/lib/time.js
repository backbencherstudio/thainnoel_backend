import { format, parse } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

/**
 * Converts an ISO string (or Date object) to a specific timezone and returns the formatted time.
 * @param {string|Date} dateOrIsoString - The ISO date string or Date object.
 * @param {string} timeZone - The target timezone.
 * @param {string} [formatStr="yyyy-MM-dd HH:mm:ss"] - Optional format string.
 * @returns {string|null} - The formatted time string.
 */
export const convertIsoToTimezone = (
  dateOrIsoString,
  timeZone,
  formatStr = "yyyy-MM-dd HH:mm:ss",
) => {
  if (!dateOrIsoString) return null;
  const date = new Date(dateOrIsoString);
  const zonedDate = toZonedTime(date, timeZone);
  return format(zonedDate, formatStr);
};

/**
 * Converts a time string (HH:mm) from one timezone to another.
 * Used specifically for schedule times.
 * @param {string} timeStr - The time string in "HH:mm" format.
 * @param {string} fromTimeZone - The source timezone.
 * @param {string} toTimeZone - The target timezone.
 * @returns {string} - The converted time string in "HH:mm" format.
 */
export const convertScheduleTime = (timeStr, fromTimeZone, toTimeZone) => {
  if (!timeStr) return timeStr;

  const date = parse(timeStr, "HH:mm", new Date());
  // We explicitly format it to strip any local timezone information from 'date'
  // and treat the resulting string as belonging to 'fromTimeZone'
  const baseDateStr = format(date, "yyyy-MM-dd HH:mm:ss");

  // Interpret the time string as being in the 'fromTimeZone'
  const fromDate = fromZonedTime(baseDateStr, fromTimeZone);

  // Convert to 'toTimeZone'
  const toDate = toZonedTime(fromDate, toTimeZone);

  return format(toDate, "HH:mm");
};
