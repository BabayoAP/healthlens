import { describe, expect, it } from 'vitest';
import snapshot from './spaceWeatherSnapshot.json';
import { assessSpaceWeather, parseNotifications, type SpaceWeatherEvent } from './spaceWeather';

const NOW = Date.parse('2026-11-15T12:00:00Z');
const HOUR = 3_600_000;
const event = (type: SpaceWeatherEvent['type'], hoursAgo: number): SpaceWeatherEvent => ({
  id: `${type}-${hoursAgo}`, type, issued: new Date(NOW - hoursAgo * HOUR).toISOString(), url: 'https://example.org', summary: 's',
});

describe('parseNotifications', () => {
  it('reads the saved NASA DONKI snapshot', () => {
    const events = parseNotifications(snapshot.notifications);
    expect(events.length).toBe(snapshot.notifications.length);
    expect(events.every((e) => e.summary.length > 0 && e.summary.length <= 225)).toBe(true);
    // newest first
    expect(Date.parse(events[0].issued)).toBeGreaterThanOrEqual(Date.parse(events[events.length - 1].issued));
  });

  it('ignores malformed input instead of crashing', () => {
    expect(parseNotifications(null)).toEqual([]);
    expect(parseNotifications({ error: 'rate limited' })).toEqual([]);
    expect(parseNotifications([{ messageType: 'SEP' }, { messageType: 'NOPE', messageID: 'x', messageIssueTime: '2026-11-01T00:00Z' }, 'junk'])).toEqual([]);
  });

  it('takes the summary section out of the message body', () => {
    const [e] = parseNotifications([{
      messageType: 'SEP', messageID: 'a', messageIssueTime: '2026-11-14T10:00Z', messageURL: 'u',
      messageBody: '## Message Type: x\n##\n## Summary:\n\nProton flux is elevated.\nShelter advised.\n\n## Notes:\nignore me',
    }]);
    expect(e.summary).toBe('Proton flux is elevated. Shelter advised.');
  });
});

describe('assessSpaceWeather', () => {
  it('is OK when nothing relevant is recent', () => {
    expect(assessSpaceWeather([event('CME', 5), event('SEP', 200)], NOW, 'moon').status).toBe('ok');
  });

  it('acts on a solar particle event in the last 3 days, in every environment', () => {
    for (const env of ['station', 'spacecraft', 'moon', 'mars'] as const) {
      expect(assessSpaceWeather([event('SEP', 20)], NOW, env).status).toBe('act');
    }
  });

  it('watches radiation belt enhancements only in low Earth orbit', () => {
    expect(assessSpaceWeather([event('RBE', 10)], NOW, 'station').status).toBe('watch');
    expect(assessSpaceWeather([event('RBE', 10)], NOW, 'mars').status).toBe('ok');
  });

  it('watches after a strong flare', () => {
    expect(assessSpaceWeather([event('FLR', 6)], NOW, 'spacecraft').status).toBe('watch');
  });
});
