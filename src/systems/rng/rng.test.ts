import { describe, it, expect } from 'vitest';
import { Rng } from './index';

describe('Rng', () => {
  it('produces deterministic sequences for a given seed', () => {
    const a = new Rng(42);
    const b = new Rng(42);
    const seqA = Array.from({ length: 5 }, () => a.next());
    const seqB = Array.from({ length: 5 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it('produces different sequences for different seeds', () => {
    const a = new Rng(1);
    const b = new Rng(2);
    expect(a.next()).not.toEqual(b.next());
  });

  it('next() returns values in [0, 1)', () => {
    const r = new Rng(123);
    for (let i = 0; i < 1000; i++) {
      const v = r.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('intRange is inclusive on both ends', () => {
    const r = new Rng(7);
    const seen = new Set<number>();
    for (let i = 0; i < 500; i++) seen.add(r.intRange(1, 3));
    expect(seen).toEqual(new Set([1, 2, 3]));
  });

  it('save/restore round-trips state', () => {
    const r = new Rng(99);
    r.next();
    r.next();
    const saved = r.getState();
    const beforeRestore = r.next();
    const restored = Rng.fromState(saved);
    expect(restored.next()).toEqual(beforeRestore);
  });
});
