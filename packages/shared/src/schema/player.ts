import { z } from 'zod';
import { GoalkeepingAttrs, MentalAttrs, PhysicalAttrs, TechnicalAttrs } from './attributes';

/** Pitch positions (FM-style strata). L/R are from the player's own point of view, facing the opponent goal. */
export const POSITIONS = ['GK', 'DL', 'DC', 'DR', 'WBL', 'WBR', 'DM', 'ML', 'MC', 'MR', 'AML', 'AMC', 'AMR', 'ST'] as const;
export const Position = z.enum(POSITIONS);
export type Position = z.infer<typeof Position>;

export const Foot = z.enum(['L', 'R', 'B']);
export type Foot = z.infer<typeof Foot>;

export const Player = z
  .object({
    /** Stable slug, unique across all clubs, e.g. "rma-courtois". */
    id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    name: z.string().min(2),
    /** Used in commentary and on chips; defaults to the last word of `name`. */
    shortName: z.string().min(1).optional(),
    number: z.number().int().min(1).max(99),
    /** Age on 1 September 2026. */
    age: z.number().int().min(15).max(45),
    /** ISO 3166-1 alpha-3 / FIFA-style code, e.g. "FRA". */
    nationality: z.string().regex(/^[A-Z]{3}$/),
    /** First entry = best position. Positions not listed are played with a familiarity penalty. */
    positions: z.array(Position).min(1),
    foot: Foot,
    technical: TechnicalAttrs,
    mental: MentalAttrs,
    physical: PhysicalAttrs,
    /** Required for goalkeepers; optional (treated as all 1s) for outfield players. */
    goalkeeping: GoalkeepingAttrs.optional(),
    /** Set when the player's presence at this club for 2026-27 could not be confirmed. */
    flag: z.string().optional(),
  })
  .strict()
  .superRefine((p, ctx) => {
    if (p.positions.includes('GK') && !p.goalkeeping) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${p.id}: goalkeepers need a goalkeeping block` });
    }
    if (new Set(p.positions).size !== p.positions.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${p.id}: duplicate positions` });
    }
  });
export type Player = z.infer<typeof Player>;

const PARTICLES = new Set(['de', 'da', 'di', 'do', 'dos', 'das', 'del', 'della', 'van', 'von', 'der', 'den', 'ter', 'ten', 'le', 'la', 'du', 'el', 'al', 'bin', 'mac', 'st.']);
const SUFFIXES = new Set(['júnior', 'junior', 'jr', 'jr.', 'filho', 'neto', 'ii', 'iii']);

/** Commentary/chip name: surname with particles ("De Bruyne", "van Dijk"); first name for "… Júnior". */
export function shortNameOf(p: Pick<Player, 'name' | 'shortName'>): string {
  if (p.shortName) return p.shortName;
  const parts = p.name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!;
  if (SUFFIXES.has(parts[parts.length - 1]!.toLowerCase())) return parts[0]!;
  let i = parts.length - 1;
  while (i > 1 && PARTICLES.has(parts[i - 1]!.toLowerCase())) i--;
  const out = parts.slice(i).join(' ');
  return out.charAt(0).toUpperCase() + out.slice(1);
}
