/**
 * Seeded, deterministic RNG (mulberry32).
 * Pure TypeScript — no Phaser. Save-compatible: state is a single uint32.
 */

export interface RngState {
  seed: number;
}

export class Rng {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  static fromState(state: RngState): Rng {
    return new Rng(state.seed);
  }

  getState(): RngState {
    return { seed: this.state };
  }

  /** Returns a float in [0, 1). */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Integer in [min, max] inclusive. */
  intRange(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** Picks one element from a non-empty array. */
  pick<T>(arr: readonly T[]): T {
    if (arr.length === 0) throw new Error('Rng.pick: empty array');
    const idx = this.intRange(0, arr.length - 1);
    return arr[idx] as T;
  }
}
