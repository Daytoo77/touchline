import { z } from 'zod';
import { FORMATION_IDS } from '../formations';
import { ROLE_IDS } from '../roles';

export const FormationIdZ = z.enum(FORMATION_IDS);
export const RoleIdZ = z.enum(ROLE_IDS);
export const DutyZ = z.enum(['D', 'S', 'A']);

const step = (min: number, max: number) => z.number().int().min(min).max(max);

/** Team instructions. 0 is always the "standard" setting. */
export const Instructions = z
  .object({
    /** -3 Very Defensive … 0 Balanced … +3 Very Attacking */
    mentality: step(-3, 3),
    /** -2 Much Less … +2 Much More */
    pressing: step(-2, 2),
    /** -2 Much Deeper … +2 Much Higher */
    line: step(-2, 2),
    /** -2 Very Narrow … +2 Very Wide */
    width: step(-2, 2),
    /** -2 Much Lower … +2 Much Higher */
    tempo: step(-2, 2),
    /** -2 Much Shorter … +2 Much More Direct */
    directness: step(-2, 2),
    /** 0 Never … 4 Always */
    timeWasting: step(0, 4),
  })
  .strict();
export type Instructions = z.infer<typeof Instructions>;

export const DEFAULT_INSTRUCTIONS: Instructions = { mentality: 0, pressing: 0, line: 0, width: 0, tempo: 0, directness: 0, timeWasting: 0 };

export const TacticSlot = z
  .object({
    playerId: z.string().nullable(),
    role: RoleIdZ,
    duty: DutyZ,
  })
  .strict();
export type TacticSlot = z.infer<typeof TacticSlot>;

export const SetPieces = z
  .object({
    captain: z.string(),
    penalty: z.string(),
    freeKick: z.string(),
    cornerLeft: z.string(),
    cornerRight: z.string(),
  })
  .strict();
export type SetPieces = z.infer<typeof SetPieces>;

export const Tactic = z
  .object({
    formation: FormationIdZ,
    slots: z.array(TacticSlot).length(11),
    instructions: Instructions,
    setPieces: SetPieces,
  })
  .strict();
export type Tactic = z.infer<typeof Tactic>;

export const TeamSheet = z
  .object({
    clubId: z.string(),
    tactic: Tactic,
    /** Named substitutes, at most 12 (UEFA rule). */
    bench: z.array(z.string()).max(12),
  })
  .strict();
export type TeamSheet = z.infer<typeof TeamSheet>;

export const SHOUTS = ['encourage', 'demandMore', 'tightenUp', 'focus', 'showPassion', 'calmDown'] as const;
export const ShoutZ = z.enum(SHOUTS);
export type Shout = z.infer<typeof ShoutZ>;
export const SHOUT_LABEL: Record<Shout, string> = {
  encourage: 'Encourage',
  demandMore: 'Demand More',
  tightenUp: 'Tighten Up',
  focus: 'Focus',
  showPassion: 'Show Passion',
  calmDown: 'Calm Down',
};
export const SHOUT_HINT: Record<Shout, string> = {
  encourage: 'Lift morale. Safest when things are not going your way.',
  demandMore: 'Push for more effort. Determined players respond; fragile ones may wilt.',
  tightenUp: 'Deeper, narrower and safer for a while. Good for protecting a lead.',
  focus: 'Sharpen concentration: fewer errors and better decisions.',
  showPassion: 'More aggression and pressing. Risk of more fouls and cards.',
  calmDown: 'Lower aggression and settle nerves. Fewer fouls.',
};

export const TALK_TONES = ['praise', 'encourage', 'calm', 'demand', 'passion', 'noPressure', 'disappointed'] as const;
export const TalkToneZ = z.enum(TALK_TONES);
export type TalkTone = z.infer<typeof TalkToneZ>;
export const TALK_LABEL: Record<TalkTone, string> = {
  praise: 'Praise: “Excellent so far, keep it up.”',
  encourage: 'Encourage: “I believe in you, go and get it.”',
  calm: 'Calm: “Stay composed, nothing is decided.”',
  demand: 'Demand more: “That is not good enough.”',
  passion: 'Show passion: “Leave everything out there!”',
  noPressure: 'No pressure: “Nobody expects anything, enjoy it.”',
  disappointed: 'Disappointed: “I expected much more from you.”',
};
