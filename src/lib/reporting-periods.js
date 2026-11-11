/** Completed reporting days in Pakistan Standard Time. The current day is excluded. */
export const REPORT_PERIODS = [
  { days: 7, label: '7 days' },
  { days: 14, label: '14 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '3 months' },
  { days: 180, label: '6 months' },
  { days: 365, label: '1 year' },
];
export const validReportDays = value => REPORT_PERIODS.some(p => p.days === Number(value)) ? Number(value) : 30;
export function pakistanDate(value = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Karachi', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(value);
  const v = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${v.year}-${v.month}-${v.day}`;
}
export function shiftDate(date, delta) {
  const d = new Date(`${date}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}
export const yesterdayPK = () => shiftDate(pakistanDate(), -1);
export function completedRange(days) {
  const to = yesterdayPK();
  return { from: shiftDate(to, -(validReportDays(days) - 1)), to };
}
export function validateExportRange(from, to) {
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  if (!iso.test(from || '') || !iso.test(to || '') || !Number.isFinite(Date.parse(`${from}T00:00:00Z`)) || !Number.isFinite(Date.parse(`${to}T00:00:00Z`))) return 'Select both From and To dates.';
  if (new Date(from).toISOString().slice(0, 10) !== from || new Date(to).toISOString().slice(0, 10) !== to) return 'Select valid calendar dates.';
  if (from > to) return 'From date must be on or before To date.';
  if (to > yesterdayPK()) return 'Today and future dates cannot be exported. Latest available date is yesterday.';
  if ((new Date(to) - new Date(from)) / 86400000 > 365) return 'Choose a date range of at most 366 days.';
  return '';
}
