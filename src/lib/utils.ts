import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format date as dd/MM/yyyy (ngày/tháng/năm) */
export function formatDate(dateInput: Date | string): string {
  const d = new Date(dateInput)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

/** Format date and time as dd/MM/yyyy HH:mm */
export function formatDateTime(dateInput: Date | string): string {
  const d = new Date(dateInput)
  const datePart = formatDate(d)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${datePart} ${h}:${m}`
} 