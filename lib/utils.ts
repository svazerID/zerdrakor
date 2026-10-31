import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatViews(views: number): string {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1).replace('.0', '') + 'M';
  }
  if (views >= 1000) {
    return (views / 1000).toFixed(1).replace('.0', '') + 'K';
  }
  return views.toLocaleString('id-ID');
}

export function formatNumber(num: number): string {
  return num.toLocaleString('id-ID');
}

export const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const;

export function getTodayWIBDay(): 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu' {
  // Convert current time to Asia/Jakarta (WIB)
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Jakarta', weekday: 'long' };
  const dayName = new Intl.DateTimeFormat('id-ID', options).format(now);

  const normalized = dayName.charAt(0).toUpperCase() + dayName.slice(1);
  const validDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  if (validDays.includes(normalized)) {
    return normalized as any;
  }
  // fallback based on UTC+7
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wibDate = new Date(utc + 7 * 3600000);
  return INDONESIAN_DAYS[wibDate.getDay()] as any;
}
