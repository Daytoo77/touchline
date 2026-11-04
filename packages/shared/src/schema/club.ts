import { z } from 'zod';
import { Player } from './player';
import { FormationIdZ, Instructions, TacticSlot } from './tactic';

const Hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const KitPattern = z.enum(['plain', 'stripes', 'hoops', 'halves', 'sash']);
export const Kit = z
  .object({
    shirt: Hex,
    /** Second colour for stripes/hoops/halves/sash; ignored when plain. */
    trim: Hex,
    shorts: Hex,
    number: Hex,
    pattern: KitPattern,
  })
  .strict();
export type Kit = z.infer<typeof Kit>;

export const Club = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    name: z.string(),
    shortName: z.string(),
    /** Three-letter scoreboard code. */
    abbr: z.string().regex(/^[A-Z]{3}$/),
    country: z.string().regex(/^[A-Z]{3}$/),
    /** League-phase pot (1..4). */
    pot: z.number().int().min(1).max(4),
    kits: z.object({ home: Kit, away: Kit, gk: Kit }).strict(),
    /** Pre-fills the setup screen and drives the AI. Player ids may be null: the auto-picker fills them. */
    defaultTactic: z
      .object({
        formation: FormationIdZ,
        instructions: Instructions,
        roles: z.array(TacticSlot.pick({ role: true, duty: true })).length(11).optional(),
      })
      .strict(),
    /** ISO date of the last squad review. */
    dataAsOf: z.string(),
    notes: z.string().optional(),
    players: z.array(Player).min(18),
  })
  .strict()
  .superRefine((c, ctx) => {
    const ids = new Set<string>();
    const numbers = new Set<number>();
    let gks = 0;
    for (const p of c.players) {
      if (ids.has(p.id)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${c.id}: duplicate player id ${p.id}` });
      if (numbers.has(p.number)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${c.id}: duplicate shirt number ${p.number} (${p.name})` });
      ids.add(p.id);
      numbers.add(p.number);
      if (p.positions[0] === 'GK') gks++;
    }
    if (gks < 2) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${c.id}: needs at least 2 goalkeepers` });
  });
export type Club = z.infer<typeof Club>;
