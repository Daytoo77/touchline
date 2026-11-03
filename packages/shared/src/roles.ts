import type { Position } from './schema/player';

export type Duty = 'D' | 'S' | 'A';
export const DUTY_LABEL: Record<Duty, string> = { D: 'Defend', S: 'Support', A: 'Attack' };

/**
 * Engine-facing behaviour of a role. All offsets are metres in the team frame.
 *  attU   push forward (+) / hold (-) when the team has the ball
 *  attIn  lateral pull towards the centre (+) or the touchline (-) in possession
 *  defU   height when defending, relative to the slot
 *  run    tendency to make runs in behind / into the box (0..1)
 *  support tendency to come short towards the ball carrier (0..1)
 *  roam   freedom to drift towards the ball's side (0..1)
 *  risk   appetite for risky/through passes (-1..1)
 *  dribble, shoot, cross   multipliers on those choices (1 = neutral)
 *  press  multiplier on involvement in pressing
 *  hold   target-man tendency: attracts long balls and holds up play (0..1)
 *  focus  how much team-mates look for this player (1 = neutral; playmakers > 1)
 */
export interface RoleParams {
  attU: number;
  attIn: number;
  defU: number;
  run: number;
  support: number;
  roam: number;
  risk: number;
  dribble: number;
  shoot: number;
  cross: number;
  press: number;
  hold: number;
  focus: number;
}

export interface RoleDef {
  id: RoleId;
  name: string;
  short: string;
  positions: Position[];
  duties: Duty[];
  description: string;
  base: Partial<RoleParams>;
}

export const ROLE_IDS = [
  'gk', 'sk',
  'cd', 'bpd', 'ncb', 'wcb',
  'fb', 'wb', 'iwb', 'nnfb', 'cwb',
  'a', 'dm', 'dlp', 'hb', 'reg', 'bwm',
  'cm', 'b2b', 'mez', 'ap', 'car',
  'wm', 'w', 'iw', 'dw',
  'am', 'ss', 'eng',
  'if',
  'af', 'p', 'tm', 'cf', 'dlf', 'f9', 'pf',
] as const;
export type RoleId = (typeof ROLE_IDS)[number];

const WIDE_DEF: Position[] = ['DL', 'DR'];
const WINGBACK: Position[] = ['DL', 'DR', 'WBL', 'WBR'];
const WIDE_MID: Position[] = ['ML', 'MR'];
const WIDE_AM: Position[] = ['AML', 'AMR'];

const R = (id: RoleId, name: string, short: string, positions: Position[], duties: Duty[], description: string, base: Partial<RoleParams>): RoleDef => ({
  id, name, short, positions, duties, description, base,
});

export const ROLES: Record<RoleId, RoleDef> = {
  gk: R('gk', 'Goalkeeper', 'GK', ['GK'], ['D'], 'Stays on his line, distributes safely.', { risk: -0.6 }),
  sk: R('sk', 'Sweeper Keeper', 'SK', ['GK'], ['D', 'S', 'A'], 'Starts higher, sweeps behind a high line and plays out from the back.', { attU: 6, defU: 5, risk: -0.2 }),

  cd: R('cd', 'Central Defender', 'CD', ['DC'], ['D', 'S'], 'Solid defender: wins the ball and gives it simply.', { risk: -0.5, press: 0.8 }),
  bpd: R('bpd', 'Ball-Playing Defender', 'BPD', ['DC'], ['D', 'S'], 'Comfortable on the ball; looks for line-breaking and long passes.', { risk: 0.2, focus: 1.15 }),
  ncb: R('ncb', 'No-Nonsense Centre-Back', 'NCB', ['DC'], ['D'], 'Clears danger first, asks questions later.', { risk: -0.9, focus: 0.7, press: 0.9 }),
  wcb: R('wcb', 'Wide Centre-Back', 'WCB', ['DC'], ['D', 'S', 'A'], 'Outside centre-back in a back three who steps out and overlaps.', { attU: 5, attIn: -6, run: 0.15, cross: 1.1 }),

  fb: R('fb', 'Full-Back', 'FB', WIDE_DEF, ['D', 'S', 'A'], 'Balanced full-back: supports attacks down the flank.', { attU: 10, attIn: -1, run: 0.2, cross: 1.0 }),
  wb: R('wb', 'Wing-Back', 'WB', WINGBACK, ['D', 'S', 'A'], 'Provides width high up the pitch and crosses.', { attU: 18, attIn: -3, run: 0.35, cross: 1.3, dribble: 1.1 }),
  iwb: R('iwb', 'Inverted Wing-Back', 'IWB', WINGBACK, ['D', 'S', 'A'], 'Tucks into midfield in possession to create an overload.', { attU: 10, attIn: 18, support: 0.6, cross: 0.5, focus: 1.1 }),
  nnfb: R('nnfb', 'No-Nonsense Full-Back', 'NNFB', WIDE_DEF, ['D'], 'Stays home and clears his lines.', { attU: 2, risk: -0.8, cross: 0.6 }),
  cwb: R('cwb', 'Complete Wing-Back', 'CWB', ['WBL', 'WBR', 'DL', 'DR'], ['S', 'A'], 'Flies forward, dribbles, crosses and roams.', { attU: 22, attIn: -2, run: 0.45, cross: 1.3, dribble: 1.3, roam: 0.3 }),

  a: R('a', 'Anchor', 'A', ['DM'], ['D'], 'Sits in front of the defence and screens.', { attU: -4, defU: -3, risk: -0.5, roam: 0, press: 0.7 }),
  dm: R('dm', 'Defensive Midfielder', 'DM', ['DM'], ['D', 'S'], 'Breaks up play and recycles possession.', { attU: 0, risk: -0.3, press: 1.0 }),
  dlp: R('dlp', 'Deep-Lying Playmaker', 'DLP', ['DM', 'MC'], ['D', 'S'], 'Dictates the tempo from deep; the side looks for him.', { attU: -2, support: 0.8, risk: 0.35, focus: 1.45 }),
  hb: R('hb', 'Half-Back', 'HB', ['DM'], ['D'], 'Drops between the centre-backs in possession.', { attU: -10, risk: -0.2, support: 0.4 }),
  reg: R('reg', 'Regista', 'REG', ['DM'], ['S'], 'Free-roaming deep playmaker who takes risks.', { attU: 2, support: 0.7, roam: 0.5, risk: 0.6, focus: 1.6 }),
  bwm: R('bwm', 'Ball-Winning Midfielder', 'BWM', ['DM', 'MC'], ['D', 'S'], 'Harries opponents and wins the ball back.', { press: 1.6, risk: -0.2, roam: 0.3 }),

  cm: R('cm', 'Central Midfielder', 'CM', ['MC'], ['D', 'S', 'A'], 'All-round midfielder.', {}),
  b2b: R('b2b', 'Box-to-Box Midfielder', 'BBM', ['MC', 'DM'], ['S'], 'Gets up and down the pitch, arrives late in the box.', { attU: 6, run: 0.35, roam: 0.3, press: 1.2, shoot: 1.15 }),
  mez: R('mez', 'Mezzala', 'MEZ', ['MC'], ['S', 'A'], 'Drifts into the half-space and attacks the channel.', { attU: 9, attIn: -8, run: 0.4, dribble: 1.2, shoot: 1.1 }),
  ap: R('ap', 'Advanced Playmaker', 'AP', ['MC', 'AMC', 'ML', 'MR', 'AML', 'AMR'], ['S', 'A'], 'Finds pockets between the lines and creates chances.', { attU: 4, attIn: 4, support: 0.6, roam: 0.5, risk: 0.6, focus: 1.6 }),
  car: R('car', 'Carrilero', 'CAR', ['MC'], ['S'], 'Shuttles sideways to cover the flank.', { attU: 0, attIn: -4, risk: -0.3, press: 1.1 }),

  wm: R('wm', 'Wide Midfielder', 'WM', WIDE_MID, ['D', 'S', 'A'], 'Works the flank in both directions.', { attU: 4, attIn: 0, cross: 1.1, press: 1.0 }),
  w: R('w', 'Winger', 'W', [...WIDE_MID, ...WIDE_AM], ['S', 'A'], 'Hugs the touchline, beats his man and crosses.', { attU: 8, attIn: -4, run: 0.3, dribble: 1.3, cross: 1.5 }),
  iw: R('iw', 'Inverted Winger', 'IW', [...WIDE_MID, ...WIDE_AM], ['S', 'A'], 'Cuts inside onto his stronger foot to shoot or pass.', { attU: 6, attIn: 8, dribble: 1.3, cross: 0.8, shoot: 1.15, focus: 1.1 }),
  dw: R('dw', 'Defensive Winger', 'DW', WIDE_MID, ['D', 'S'], 'Presses the full-back and tracks back diligently.', { attU: 2, press: 1.4, cross: 1.0 }),

  am: R('am', 'Attacking Midfielder', 'AM', ['AMC'], ['S', 'A'], 'Links midfield and attack, shoots from the edge.', { attU: 2, support: 0.4, shoot: 1.2, focus: 1.2 }),
  ss: R('ss', 'Shadow Striker', 'SS', ['AMC'], ['A'], 'Runs beyond the striker into the box.', { attU: 8, run: 0.6, shoot: 1.3 }),
  eng: R('eng', 'Enganche', 'ENG', ['AMC'], ['S'], 'Static playmaker who waits for the ball and unlocks defences.', { attU: 0, roam: 0.1, risk: 0.7, press: 0.5, focus: 1.8 }),

  if: R('if', 'Inside Forward', 'IF', [...WIDE_AM, ...WIDE_MID], ['S', 'A'], 'Starts wide and cuts inside to attack the box.', { attU: 8, attIn: 11, run: 0.5, dribble: 1.25, cross: 0.6, shoot: 1.35, focus: 1.1 }),

  af: R('af', 'Advanced Forward', 'AF', ['ST'], ['A'], 'Plays on the shoulder of the last defender.', { attU: 4, run: 0.7, shoot: 1.25, press: 1.0 }),
  p: R('p', 'Poacher', 'P', ['ST'], ['A'], 'Lives in the box and waits for chances.', { attU: 5, run: 0.6, shoot: 1.4, press: 0.6, support: 0.0 }),
  tm: R('tm', 'Target Man', 'TM', ['ST'], ['S', 'A'], 'Big presence to aim long balls and crosses at.', { attU: 2, hold: 0.9, run: 0.2, shoot: 1.1, focus: 1.1 }),
  cf: R('cf', 'Complete Forward', 'CF', ['ST'], ['S', 'A'], 'Does a bit of everything: links, holds, runs and scores.', { attU: 2, run: 0.45, hold: 0.4, support: 0.3, shoot: 1.2, focus: 1.2 }),
  dlf: R('dlf', 'Deep-Lying Forward', 'DLF', ['ST'], ['S', 'A'], 'Drops off to link play and bring others in.', { attU: -5, support: 0.7, hold: 0.4, risk: 0.3, focus: 1.15 }),
  f9: R('f9', 'False Nine', 'F9', ['ST'], ['S'], 'Drops deep to drag centre-backs out of position.', { attU: -9, support: 0.8, roam: 0.6, risk: 0.5, dribble: 1.2, focus: 1.3 }),
  pf: R('pf', 'Pressing Forward', 'PF', ['ST'], ['D', 'S', 'A'], 'Leads the press from the front.', { press: 1.7, run: 0.45 }),
};

const DEFAULT_PARAMS: RoleParams = {
  attU: 0,
  attIn: 0,
  defU: 0,
  run: 0.15,
  support: 0.3,
  roam: 0.2,
  risk: 0,
  dribble: 1,
  shoot: 1,
  cross: 1,
  press: 1,
  hold: 0,
  focus: 1,
};

/** Resolve the engine parameters for a role + duty. */
export function roleParams(role: RoleId, duty: Duty): RoleParams {
  const p: RoleParams = { ...DEFAULT_PARAMS, ...ROLES[role].base };
  if (duty === 'D') {
    p.attU -= 6;
    p.run *= 0.4;
    p.defU -= 2;
    p.risk -= 0.25;
    p.shoot *= 0.75;
  } else if (duty === 'A') {
    p.attU += 6;
    p.run = Math.min(1, p.run * 1.6 + 0.1);
    p.risk += 0.2;
    p.shoot *= 1.15;
    p.press *= 1.05;
  }
  return p;
}

export function rolesForPosition(pos: Position): RoleDef[] {
  return ROLE_IDS.map((id) => ROLES[id]).filter((r) => r.positions.includes(pos));
}

export function isRoleValid(role: RoleId, duty: Duty, pos: Position): boolean {
  const r = ROLES[role];
  return r.positions.includes(pos) && r.duties.includes(duty);
}
