import { describe, expect, it } from 'vitest';
import {
  daysUntil,
  formatCostTotal,
  isOverdue,
  parseAmount,
  sanitizeAmount,
  timeAgo,
  truncate,
  whoLabel,
} from '@/lib/format';

const TODAY = new Date('2026-07-09T00:00:00');

describe('isOverdue', () => {
  it('flags a past deadline on an open task', () => {
    expect(isOverdue('2026-07-08', false, TODAY)).toBe(true);
  });

  it('does not flag today', () => {
    expect(isOverdue('2026-07-09', false, TODAY)).toBe(false);
  });

  it('never flags a completed task, however late', () => {
    expect(isOverdue('2020-01-01', true, TODAY)).toBe(false);
  });

  it('treats an empty deadline as not overdue', () => {
    expect(isOverdue('', false, TODAY)).toBe(false);
  });
});

describe('daysUntil', () => {
  it('counts forward to the key handover', () => {
    expect(daysUntil('2026-07-15', TODAY)).toBe(6);
  });

  it('returns zero on the day itself', () => {
    expect(daysUntil('2026-07-09', TODAY)).toBe(0);
  });

  it('goes negative once the moment has passed', () => {
    expect(daysUntil('2026-07-08', TODAY)).toBe(-1);
  });
});

describe('timeAgo', () => {
  const now = 1_000_000_000_000;

  it('calls the last minute "zojuist"', () => {
    expect(timeAgo(now - 59_000, now)).toBe('zojuist');
  });

  it('counts minutes', () => {
    expect(timeAgo(now - 5 * 60_000, now)).toBe('5 min geleden');
  });

  it('counts hours', () => {
    expect(timeAgo(now - 3 * 3_600_000, now)).toBe('3 uur geleden');
  });

  it('counts days', () => {
    expect(timeAgo(now - 2 * 86_400_000, now)).toBe('2 dagen geleden');
  });
});

describe('parseAmount', () => {
  it('accepts a decimal comma', () => {
    expect(parseAmount('1200,50')).toBe(1200.5);
  });

  it('accepts a decimal period', () => {
    expect(parseAmount('1200.50')).toBe(1200.5);
  });

  it('reads periods before a comma as thousand separators', () => {
    expect(parseAmount('1.234,50')).toBe(1234.5);
    expect(parseAmount('1.234.567,89')).toBe(1234567.89);
  });

  it('reads periods that group digits in threes as thousand separators', () => {
    expect(parseAmount('12.500')).toBe(12500);
    expect(parseAmount('1.234.567')).toBe(1234567);
  });

  it('still reads a lone period as a decimal point', () => {
    expect(parseAmount('1200.50')).toBe(1200.5);
    expect(parseAmount('0.5')).toBe(0.5);
  });

  it('treats unparseable text as zero', () => {
    expect(parseAmount('')).toBe(0);
    expect(parseAmount('indicatie')).toBe(0);
  });
});

describe('formatCostTotal', () => {
  it('sums and formats in Dutch', () => {
    expect(formatCostTotal(['1000', '234,50'])).toBe('€ 1.234,5');
  });

  it('reports the empty state rather than € 0', () => {
    expect(formatCostTotal(['', ''])).toBe('nog geen indicaties');
    expect(formatCostTotal([])).toBe('nog geen indicaties');
  });
});

describe('sanitizeAmount', () => {
  it('keeps digits, comma and period', () => {
    expect(sanitizeAmount('1.234,50')).toBe('1.234,50');
  });

  it('strips everything else', () => {
    expect(sanitizeAmount('€ 12a3 ')).toBe('123');
  });
});

describe('whoLabel', () => {
  it('decorates the four known assignees', () => {
    expect(whoLabel('Wally')).toBe('🦆 Wally');
    expect(whoLabel('WJ')).toBe('🐵 WJ');
    expect(whoLabel('Samen')).toBe('🦆🐵 Samen');
    expect(whoLabel('n.t.b.')).toBe('· n.t.b.');
  });

  it('leaves a guest name bare', () => {
    expect(whoLabel('Sanne')).toBe('Sanne');
  });
});

describe('truncate', () => {
  it('leaves short text alone', () => {
    expect(truncate('kort', 10)).toBe('kort');
  });

  it('adds an ellipsis when it cuts', () => {
    expect(truncate('abcdefghij', 4)).toBe('abcd…');
  });
});
