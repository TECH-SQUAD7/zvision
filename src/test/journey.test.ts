import { describe, expect, it } from 'vitest';
import { journeyUrl } from '@/lib/experience';

describe('Journey configuration', () => {
  it('has no subscriber destination when unconfigured', () => { expect(journeyUrl(undefined)).toBeNull(); });
  it('links to the configured secure updates channel', () => { expect(journeyUrl('https://example.com/updates')).toBe('https://example.com/updates'); });
  it('rejects unsafe destinations', () => { expect(journeyUrl('javascript:alert(1)')).toBeNull(); });
});