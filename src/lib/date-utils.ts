/**
 * TRUSTLINE CENTRALIZED TIMESTAMP UTILITY (Asia/Kolkata / IST)
 * 
 * Standardizes display formatting, ISO parsing, and UTC-to-IST conversion across
 * Alerts Queue, Attack DNA Timeline, Money-Flow Graph, Case Revisions, and Audit Trail.
 * 
 * Timezone Target: Asia/Kolkata (IST: UTC +05:30)
 * Example Format: "10 Oct 2026, 10:26:41 PM IST"
 */

export interface FormattedTimestamp {
  formattedIST: string;
  dateStr: string;
  timeStr: string;
  iso: string;
  isValid: boolean;
}

/**
 * Formats any Date object, ISO string, or timestamp integer into standardized IST display format.
 */
export function formatIST(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) return 'N/A';

  try {
    const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return 'Invalid Date';

    // Format using Intl.DateTimeFormat in Asia/Kolkata timezone
    const formatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const parts = formatter.formatToParts(d);
    let day = '', month = '', year = '', hour = '', minute = '', second = '', dayPeriod = '';

    for (const p of parts) {
      if (p.type === 'day') day = p.value;
      if (p.type === 'month') month = p.value;
      if (p.type === 'year') year = p.value;
      if (p.type === 'hour') hour = p.value;
      if (p.type === 'minute') minute = p.value;
      if (p.type === 'second') second = p.value;
      if (p.type === 'dayPeriod') dayPeriod = p.value.toUpperCase();
    }

    return `${day} ${month} ${year}, ${hour}:${minute}:${second} ${dayPeriod} IST`;
  } catch (err) {
    return 'Invalid Date';
  }
}

/**
 * Returns detailed timestamp components (date, time, IST string, ISO) for UI cards.
 */
export function parseTimestampDetails(dateInput: Date | string | number | null | undefined): FormattedTimestamp {
  if (!dateInput) {
    return {
      formattedIST: 'Timestamp Missing',
      dateStr: 'N/A',
      timeStr: 'N/A',
      iso: '',
      isValid: false,
    };
  }

  try {
    const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) {
      return {
        formattedIST: 'Invalid Timestamp',
        dateStr: 'Invalid',
        timeStr: 'Invalid',
        iso: '',
        isValid: false,
      };
    }

    const formattedIST = formatIST(d);

    const dateOnlyFormatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const timeOnlyFormatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    return {
      formattedIST,
      dateStr: dateOnlyFormatter.format(d),
      timeStr: `${timeOnlyFormatter.format(d)} IST`,
      iso: d.toISOString(),
      isValid: true,
    };
  } catch {
    return {
      formattedIST: 'Invalid Timestamp',
      dateStr: 'Invalid',
      timeStr: 'Invalid',
      iso: '',
      isValid: false,
    };
  }
}

/**
 * Safely compares two timestamp inputs for sorting (newest first or oldest first).
 */
export function compareTimestamps(a: Date | string | number, b: Date | string | number, descending = true): number {
  const timeA = new Date(a).getTime() || 0;
  const timeB = new Date(b).getTime() || 0;
  return descending ? timeB - timeA : timeA - timeB;
}
