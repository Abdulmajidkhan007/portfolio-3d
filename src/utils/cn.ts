type ClassValue = string | number | false | null | undefined

/** Joins conditional class names. Small on purpose — no clsx dependency. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}
