
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Debounce function with promise support
 * @param func - Function to debounce
 * @param waitFor - Wait time in milliseconds
 * @returns Debounced function that returns a promise
 */
export function debounce<F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
): (...args: Parameters<F>) => Promise<ReturnType<F>> {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let resolveList: Array<(value: ReturnType<F> | PromiseLike<ReturnType<F>>) => void> = [];
  
  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    return new Promise((resolve) => {
      resolveList.push(resolve);
      
      if (timeout) {
        clearTimeout(timeout);
      }
      
      timeout = setTimeout(() => {
        const result = func(...args);
        resolveList.forEach(r => r(result));
        resolveList = [];
        timeout = null;
      }, waitFor);
    });
  };
}

/**
 * Formats a date string to a user-friendly format
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

/**
 * Truncates text to a specific length and adds ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Extracts plain text from HTML content
 * @param html - HTML content
 * @returns Plain text without HTML tags
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
