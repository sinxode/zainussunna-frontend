import { format, parseISO } from 'date-fns';

export function formatINR(value: number | string | null | undefined, showDecimals: boolean = false): string {
  if (value === null || value === undefined || value === '') return '₹0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '₹0';

  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(absNum);

  return isNegative ? `-${formatted}` : formatted;
}

export function formatIndianDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const date = typeof dateStr === 'string' && dateStr.includes('T') ? parseISO(dateStr) : new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return format(date, 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
}

export function formatIndianDateTime(dateTimeStr: string | null | undefined): string {
  if (!dateTimeStr) return '-';
  try {
    const date = parseISO(dateTimeStr);
    if (isNaN(date.getTime())) return dateTimeStr;
    return format(date, 'dd MMM yyyy, hh:mm a');
  } catch {
    return dateTimeStr;
  }
}

export function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr) return '-';
  try {
    // If format is HH:mm:ss or HH:mm
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      const hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      return `${formattedHours}:${minutes} ${ampm}`;
    }
    return timeStr;
  } catch {
    return timeStr;
  }
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '-';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) {
    return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  return phone;
}
