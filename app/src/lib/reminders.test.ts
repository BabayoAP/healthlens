import { describe, expect, it } from 'vitest';
import { checkHistory } from './reminders';

describe('checkHistory', () => {
  it('counts blood pressure once per measurement and keys days from today', () => {
    const now = new Date(2026, 10, 15, 12).getTime();
    const at = new Date(2026, 10, 13, 8).toISOString();
    const h = checkHistory('bloodPressure', 'a', [
      { astronautId: 'a', indicator: 'systolic', takenAt: at },
      { astronautId: 'a', indicator: 'diastolic', takenAt: at },
      { astronautId: 'b', indicator: 'systolic', takenAt: at },
    ], [], now);
    expect([...h.entries()]).toEqual([[-2, 1]]);
  });
});
