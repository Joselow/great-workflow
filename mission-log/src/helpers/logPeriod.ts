import dayjs, { type Dayjs } from 'dayjs'

type MonthInput = string | Date | Dayjs

const WEEKS_PER_MONTH = 4

function toMonth(month: MonthInput): Dayjs {
  if (typeof month === 'string' && /^\d{4}-\d{2}$/.test(month)) {
    return dayjs(`${month}-01`)
  }
  return dayjs(month).startOf('month')
}

export function weekCountForMonth(): number {
  return WEEKS_PER_MONTH
}

export function weekIndexFromDate(date: MonthInput = dayjs()): number {
  return Math.min(Math.floor((dayjs(date).date() - 1) / 7) + 1, WEEKS_PER_MONTH)
}

export function weekRangeForMonth(
  month: MonthInput,
  week: number,
): { from: string; to: string } {
  const start = toMonth(month)
  const safeWeek = Math.min(Math.max(week, 1), WEEKS_PER_MONTH)
  const startDay = (safeWeek - 1) * 7 + 1
  const endDay = safeWeek === WEEKS_PER_MONTH ? start.daysInMonth() : startDay + 6

  return {
    from: start.date(startDay).format('YYYY-MM-DD'),
    to: start.date(endDay).format('YYYY-MM-DD'),
  }
}

export function defaultPeriod(now: Dayjs = dayjs()): { month: string; week: number } {
  return {
    month: now.format('YYYY-MM'),
    week: weekIndexFromDate(now),
  }
}

export function weekForMonthChange(month: MonthInput, now: Dayjs = dayjs()): number {
  const selected = toMonth(month)
  if (selected.year() === now.year() && selected.month() === now.month()) {
    return weekIndexFromDate(now)
  }
  return 1
}

export function shiftMonth(month: MonthInput, delta: number): string {
  return toMonth(month).add(delta, 'month').format('YYYY-MM')
}

export function monthLabel(month: MonthInput): string {
  const name = toMonth(month).format('MMMM')
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export function isValidInclusiveRange(from: string, to: string): boolean {
  return Boolean(from && to && from <= to)
}

export function logMatchesFilters(
  log: { completed?: boolean | null; createdAt: string },
  filters: { completed?: boolean | null; from: string; to: string },
): boolean {
  if (filters.completed === true && log.completed !== true) return false
  if (filters.completed === false && log.completed === true) return false

  const created = dayjs(log.createdAt)
  const from = dayjs(filters.from).startOf('day')
  const toExclusive = dayjs(filters.to).add(1, 'day').startOf('day')

  if (created.isBefore(from) || !created.isBefore(toExclusive)) return false
  return true
}
