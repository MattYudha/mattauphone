export const NOW_ISO = '2025-11-19T18:57:00+09:00'
export const NOW = new Date(NOW_ISO)
const TZ = 'Asia/Seoul'

/** "2025-11-03 03:20" (KST) -> string ISO dengan offset +09:00 */
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

const WEEKDAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const WEEKDAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

function weekdayIndex(d: Date): number {
  const { year, month, day } = parts(d)
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}

export function weekday(d: Date): string {
  return WEEKDAYS[weekdayIndex(d)]
}

export function dayKey(iso: string): string {
  const { year, month, day } = parts(new Date(iso))
  return `${year}-${month}-${day}`
}

/** 16.08 */
export function formatTime(iso: string): string {
  return formatClock(iso)
}

/** 18.57 */
export function formatClock(iso: string): string {
  const { hour, minute } = parts(new Date(iso))
  return `${String(hour).padStart(2, '0')}.${String(minute).padStart(2, '0')}`
}

/** Minggu, 2 November 2025 */
export function formatFullDate(iso: string): string {
  const d = new Date(iso)
  const { year, month, day } = parts(d)
  return `${weekday(d)}, ${day} ${MONTHS[month - 1]} ${year}`
}

function dayDiffFromNow(iso: string): number {
  const a = parts(new Date(iso))
  const b = parts(NOW)
  const ua = Date.UTC(a.year, a.month - 1, a.day)
  const ub = Date.UTC(b.year, b.month - 1, b.day)
  return Math.round((ub - ua) / 86400000)
}

/** Tanggal untuk daftar chat KakaoTalk */
export function formatListDate(iso: string): string {
  const diff = dayDiffFromNow(iso)
  if (diff === 0) return formatTime(iso)
  if (diff === 1) return 'Kemarin'
  const { year, month, day } = parts(new Date(iso))
  if (year === parts(NOW).year) return `${day} ${MONTHS_SHORT[month - 1]}`
  return `${day}/${month}/${year}`
}

/** Tanggal untuk daftar Pesan/Telepon iOS */
export function formatIosListDate(iso: string): string {
  const diff = dayDiffFromNow(iso)
  if (diff === 0) return formatTime(iso)
  if (diff === 1) return 'Kemarin'
  if (diff < 7) return weekday(new Date(iso))
  const { year, month, day } = parts(new Date(iso))
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${String(year).slice(2)}`
}

/** Pemisah di dalam utas Pesan iOS: "Sel, 11 Nov 08.40" */
export function formatIosStamp(iso: string): string {
  const d = new Date(iso)
  const diff = dayDiffFromNow(iso)
  const time = formatTime(iso)
  if (diff === 0) return `Hari ini ${time}`
  if (diff === 1) return `Kemarin ${time}`
  const { year, month, day } = parts(d)
  const suffix = year === parts(NOW).year ? '' : ` ${year}`
  return `${WEEKDAYS_SHORT[weekdayIndex(d)]}, ${day} ${MONTHS_SHORT[month - 1]}${suffix} ${time}`
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s} detik`
  return `${m} menit ${String(s).padStart(2, '0')} detik`
}

export function toTime(iso: string): number {
  return new Date(iso).getTime()
}
