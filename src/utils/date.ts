import { format } from 'date-fns';
import { Timestamp } from '@firebase/firestore';

var itsadate = require('its-a-date');

const toFormattedDate = (date: string | Date, alt?: string | Date) => {
  try {
    return format(new Date(date), 'dd LLL yyyy');
  } catch (error) {
    return format(new Date(alt ?? new Date()), 'dd LLL yyyy');
  }
};

const toDate = (date: string) => {
  try {
    return itsadate.parse(date);
  } catch {
    return null;
  }
};

function isBeforeToday(date: Timestamp) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const comparisonDate = date.toDate();
  comparisonDate.setHours(0, 0, 0, 0);

  const timeDifference = today.getTime() - comparisonDate.getTime();
  return timeDifference > 0;
}

function formatTimestamp(date: Timestamp) {
  return date.toDate().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function trialDaysRemaining(createdAt: Timestamp) {
  const trialDays = 7;
  const date = new Date(createdAt.toDate());
  date.setDate(date.getDate() + trialDays);
  return Math.max(
    0,
    Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );
}

export { toFormattedDate, toDate, isBeforeToday, formatTimestamp };
