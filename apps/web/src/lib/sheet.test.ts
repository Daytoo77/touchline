import { describe, expect, it } from 'vitest';
import { autoSheet } from '@touchline/engine';
import { getClub } from '@touchline/data';
import { FORMATION_IDS } from '@touchline/shared';
import { changeFormation, reshapeForTen } from './sheet';

describe('changeFormation', () => {
  const club = getClub('napoli')!;
  const sheet = autoSheet(club);
  it('keeps exactly the same players for every formation, even with two keepers on the pitch', () => {
    const t = structuredClone(sheet.tactic);
    const gk2 = club.players.find((p) => p.positions[0] === 'GK' && p.id !== t.slots[0]!.playerId)!;
    t.slots[5]!.playerId = gk2.id;
    const ids = new Set(t.slots.map((s) => s.playerId));
    for (const f of FORMATION_IDS) {
      const out = changeFormation(t, club.players, f);
      expect(new Set(out.slots.map((s) => s.playerId))).toEqual(ids);
      expect(out.slots[0]!.playerId).toBe(t.slots[0]!.playerId);
    }
  });
  it('with ten players leaves the most advanced slot empty', () => {
    const t = structuredClone(sheet.tactic);
    t.slots[2]!.playerId = null;
    const out = changeFormation(t, club.players, '4-4-2');
    expect(out.slots.filter((s) => !s.playerId)).toHaveLength(1);
    expect(out.slots[10]!.playerId === null || out.slots[9]!.playerId === null).toBe(true);
    expect(reshapeForTen(t)).not.toBeNull();
  });
});
