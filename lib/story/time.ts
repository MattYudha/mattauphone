export const NOW_ISO = '2025-11-19T18:57:00+09:00'
export const NOW = new Date(NOW_ISO)
const TZ = 'Asia/Seoul'

/** "2025-11-03 03:20" (KST) -> ISO string with +09:00 offset */
export function kst(dateTime: string): string {
  const [date, time] = dateTime.split(' ')
  return `${date}T${time}:00+09:00`
}

function parts(d: Date) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
  const p = Object.fromEntries(fmt.formatToParts(d).map((x) => [x.type, x.value]))
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: Number(p.hour),
    minute: Number(p.minute),
  }
}

const WEEKDAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

export function weekday(d: Date): string {
  const { year, month, day } = parts(d)
  return WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]
}

export function dayKey(iso: string): string {
  const { year, month, day } = parts(new Date(iso))
  return `${year}-${month}-${day}`
}

/** 오후 4:08 */
export function formatTime(iso: string): string {
  const { hour, minute } = parts(new Date(iso))
  const ampm = hour < 12 ? '오전' : '오후'
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${ampm} ${h}:${String(minute).padStart(2, '0')}`
}

/** 18:57 */
export function formatClock(iso: string): string {
  const { hour, minute } = parts(new Date(iso))
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

/** 2025년 11월 2일 일요일 */
export function formatFullDate(iso: string): string {
  const d = new Date(iso)
  const { year, month, day } = parts(d)
  return `${year}년 ${month}월 ${day}일 ${weekday(d)}`
}

function dayDiffFromNow(iso: string): number {
  const a = parts(new Date(iso))
  const b = parts(NOW)
  const ua = Date.UTC(a.year, a.month - 1, a.day)
  const ub = Date.UTC(b.year, b.month - 1, b.day)
  return Math.round((ub - ua) / 86400000)
}

/** 카카오톡 채팅 목록용 날짜 */
export function formatListDate(iso: string): string {
  const diff = dayDiffFromNow(iso)
  if (diff === 0) return formatTime(iso)
  if (diff === 1) return '어제'
  const { year, month, day } = parts(new Date(iso))
  if (year === parts(NOW).year) return `${month}월 ${day}일`
  return `${year}. ${month}. ${day}.`
}

/** iOS 메시지/전화 목록용 날짜 */
export function formatIosListDate(iso: string): string {
  const diff = dayDiffFromNow(iso)
  if (diff === 0) return formatTime(iso)
  if (diff === 1) return '어제'
  if (diff < 7) return weekday(new Date(iso))
  const { year, month, day } = parts(new Date(iso))
  return `${String(year).slice(2)}. ${month}. ${day}.`
}

/** iOS 메시지 스레드 내 구분용: "11월 11일 (화) 오전 8:40" */
export function formatIosStamp(iso: string): string {
  const d = new Date(iso)
  const diff = dayDiffFromNow(iso)
  const time = formatTime(iso)
  if (diff === 0) return `오늘 ${time}`
  if (diff === 1) return `어제 ${time}`
  const { year, month, day } = parts(d)
  const wd = weekday(d).slice(0, 1)
  const prefix = year === parts(NOW).year ? '' : `${year}년 `
  return `${prefix}${month}월 ${day}일 (${wd}) ${time}`
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}초`
  return `${m}분 ${String(s).padStart(2, '0')}초`
}

export function toTime(iso: string): number {
  return new Date(iso).getTime()
}
