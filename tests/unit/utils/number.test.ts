import { roundTo } from '../../../src/utils/number';

describe('roundTo', () => {
  it('rounds to the requested number of decimals', () => {
    expect(roundTo(33.333333, 2)).toBe(33.33);
    expect(roundTo(66.666666, 2)).toBe(66.67);
  });

  it('rounds to whole numbers when decimals is 0', () => {
    expect(roundTo(2.5, 0)).toBe(3);
    expect(roundTo(2.4, 0)).toBe(2);
  });

  it('leaves already-rounded values unchanged', () => {
    expect(roundTo(50, 2)).toBe(50);
  });

  it('handles zero and negative values', () => {
    expect(roundTo(0, 2)).toBe(0);
    expect(roundTo(-1.005, 2)).toBe(-1);
  });
});
