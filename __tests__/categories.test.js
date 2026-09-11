import { CATEGORIES, getCategory } from '../constants/categories';

describe('CATEGORIES', () => {
  it('has unique ids', () => {
    const ids = CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every category has label, icon and a hex colour', () => {
    for (const c of CATEGORIES) {
      expect(typeof c.label).toBe('string');
      expect(c.label.length).toBeGreaterThan(0);
      expect(typeof c.icon).toBe('string');
      expect(c.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe('getCategory', () => {
  it('returns the matching category', () => {
    expect(getCategory('food').label).toBe('Food & Drink');
  });

  it('falls back to "other" for unknown or missing ids', () => {
    expect(getCategory('does-not-exist').id).toBe('other');
    expect(getCategory(undefined).id).toBe('other');
  });
});
