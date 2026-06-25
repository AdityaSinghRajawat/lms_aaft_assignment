import { groupBy } from '../../../src/utils/collection';

describe('groupBy', () => {
  it('returns an empty map for an empty array', () => {
    const result = groupBy([], (x: { id: string }) => x.id);
    expect(result.size).toBe(0);
  });

  it('groups items by the selected key', () => {
    const items = [
      { courseId: 'c1', value: 1 },
      { courseId: 'c2', value: 2 },
      { courseId: 'c1', value: 3 },
    ];

    const result = groupBy(items, (i) => i.courseId);

    expect(result.size).toBe(2);
    expect(result.get('c1')).toEqual([
      { courseId: 'c1', value: 1 },
      { courseId: 'c1', value: 3 },
    ]);
    expect(result.get('c2')).toEqual([{ courseId: 'c2', value: 2 }]);
  });

  it('preserves insertion order within each bucket', () => {
    const items = [{ k: 'a', n: 1 }, { k: 'a', n: 2 }, { k: 'a', n: 3 }];
    const result = groupBy(items, (i) => i.k);
    expect(result.get('a')?.map((i) => i.n)).toEqual([1, 2, 3]);
  });

  it('supports numeric keys', () => {
    const result = groupBy([{ n: 1 }, { n: 1 }, { n: 2 }], (i) => i.n);
    expect(result.get(1)).toHaveLength(2);
    expect(result.get(2)).toHaveLength(1);
  });
});
