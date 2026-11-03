import type { MatchEvent, Period, Side } from '@touchline/shared';

export interface CommentaryContext {
  /** Short display name for a player id. */
  name(playerId: string): string;
  /** Team display name. */
  team(side: Side): string;
  /** The viewer's side (for "your" wording on private events). */
  you?: Side;
}

export interface CommentaryLine {
  minute: string;
  text: string;
  /** For styling: goal, card, chance, info, private. */
  tone: 'goal' | 'card' | 'chance' | 'info' | 'private' | 'whistle';
  team?: Side;
}

/** Clock text that knows which period is being played (handles added time properly). */
export function clockLabel(clockSec: number, period: Period): string {
  if (period === 5) return 'PENS';
  const ends: Record<number, number> = { 1: 45, 2: 90, 3: 105, 4: 120 };
  const end = ends[period]!;
  const min = Math.floor(clockSec / 60);
  if (min >= end) return `${end}+${min - end + 1}'`;
  return `${min + 1}'`;
}

function hash(n: number, s: string): number {
  let h = 0x811c9dc5 ^ n;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function pick(arr: readonly string[], seed: number, key: string): string {
  return arr[hash(seed, key) % arr.length]!;
}

const fill = (tpl: string, v: Record<string, string>) => tpl.replace(/\{(\w+)\}/g, (_, k: string) => v[k] ?? '');

const T = {
  goal: [
    'GOAL! {p} scores for {team}!',
    'GOAL! {p} finds the net. {team} celebrate!',
    'GOAL! {p} makes no mistake!',
    'GOAL for {team}! {p} buries it!',
  ],
  goalHeader: ['GOAL! {p} rises highest and heads it in!', 'GOAL! A powerful header from {p}!'],
  goalPenalty: ['GOAL! {p} sends the keeper the wrong way from the spot.', 'GOAL! {p} converts the penalty.'],
  goalFk: ['GOAL! What a free kick from {p}! Over the wall and in!', 'GOAL! {p} curls the free kick into the top corner!'],
  goalLong: ['GOAL! {p} lets fly from distance and it flies in!', 'GOAL! A stunning strike from range by {p}!'],
  assist: [' Set up by {a}.', ' {a} with the assist.', ' Great ball from {a}.'],
  saved: ['{p} tests the keeper, but {gk} saves.', 'Good stop by {gk} to deny {p}.', '{p} shoots, {gk} gets down well.'],
  off: ['{p} shoots wide.', '{p} fires over the bar.', '{p} drags the shot wide of the post.', 'Off target from {p}.'],
  blocked: ['{p} shoots, but it is blocked.', "{p}'s effort is charged down."],
  post: ['OFF THE WOODWORK! {p} hits the post!', '{p} rattles the crossbar!'],
  bigChance: ['Huge chance for {p}...', '{p} is through!', 'Danger! {p} in a great position...'],
  attack: ['{team} build an attack down the {zone}.', '{p} drives forward for {team}.', '{team} probing down the {zone}.', '{p} looks for an opening.'],
  corner: ['Corner to {team}. {p} to take.', '{team} win a corner.'],
  freeKickD: ['Free kick in a dangerous position for {team}. {p} stands over it.'],
  penalty: ['PENALTY to {team}! {f} is brought down.', 'The referee points to the spot! Penalty to {team}.'],
  foul: ['Foul by {p} on {v}.', '{p} brings down {v}.', 'Free kick: {p} catches {v}.'],
  yellow: ['Yellow card for {p} ({r}).', '{p} is booked for {r}.'],
  red: ['RED CARD! {p} is sent off for {r}!', '{p} sees red for {r}. {team} down to ten!'],
  second: ['Second yellow for {p}, and he is off! {team} are down a man.'],
  offside: ['{p} is flagged offside.', 'Offside against {p}.'],
  sub: ['Substitution for {team}: {in} replaces {out}.'],
  notice: ['{team} make a change on the touchline.', 'The {team} bench is making adjustments.'],
  kickoff1: ['And we are under way! {team} kick off.'],
  kickoff2: ['The second half is under way.'],
  kickoff3: ['Extra time begins!'],
  kickoff4: ['The second half of extra time is under way.'],
  stoppage: ['The fourth official shows {n} minute(s) of added time.'],
  ht: ['Half-time.'],
  preEt: ['Full-time in normal time: still level. Extra time to come.'],
  prePens: ['Still level after extra time. It will be decided on penalties!'],
  shootGoal: ['{p} scores. ({a}–{b})'],
  shootSaved: ['SAVED! {p} is denied. ({a}–{b})'],
  shootMiss: ['{p} misses the target! ({a}–{b})'],
  ft: ['Full-time! {team} win {score}.', 'It is all over. {team} are the champions!'],
  shoutPos: ['The players respond well to the {s} shout.'],
  shoutNeu: ['The players acknowledge the {s} shout.'],
  shoutNeg: ['The {s} shout does not go down well with the players.'],
  talkPos: ['The team talk lifts the dressing room.'],
  talkNeu: ['The players listen quietly to the team talk.'],
  talkNeg: ['The team talk falls flat. Some players look unhappy.'],
  subQueued: ['Substitution ready: {in} will replace {out} at the next stoppage.'],
} as const;

const SHOUT_NAME: Record<string, string> = {
  encourage: '“Encourage”',
  demandMore: '“Demand More”',
  tightenUp: '“Tighten Up”',
  focus: '“Focus”',
  showPassion: '“Show Passion”',
  calmDown: '“Calm Down”',
};

/** Turn an engine event into a commentary line, or null if it isn't worth a line. */
export function describe(ev: MatchEvent, ctx: CommentaryContext, period: Period): CommentaryLine | null {
  const minute = period === 5 ? 'PENS' : clockLabel(ev.clock, period);
  const k = ev.type + ev.t;
  const n = (id?: string) => (id ? ctx.name(id) : '');
  switch (ev.type) {
    case 'goal': {
      const pool = ev.kind === 'header' ? T.goalHeader : ev.kind === 'penalty' ? T.goalPenalty : ev.kind === 'freeKick' ? T.goalFk : ev.kind === 'longShot' ? T.goalLong : T.goal;
      let text = fill(pick(pool, ev.t, k), { p: n(ev.player), team: ctx.team(ev.team) });
      if (ev.assist) text += fill(pick(T.assist, ev.t, k + 'a'), { a: n(ev.assist) });
      text += ` ${ev.score[0]}–${ev.score[1]}`;
      return { minute, text, tone: 'goal', team: ev.team };
    }
    case 'shot': {
      const pool = ev.outcome === 'saved' ? T.saved : ev.outcome === 'blocked' ? T.blocked : ev.outcome === 'post' ? T.post : T.off;
      return { minute, text: fill(pick(pool, ev.t, k), { p: n(ev.player), gk: n(ev.gk) }), tone: 'chance', team: ev.team };
    }
    case 'bigChance':
      return { minute, text: fill(pick(T.bigChance, ev.t, k), { p: n(ev.player) }), tone: 'chance', team: ev.team };
    case 'attack':
      return { minute, text: fill(pick(T.attack, ev.t, k), { p: n(ev.player), team: ctx.team(ev.team), zone: ev.zone === 'centre' ? 'middle' : ev.zone }), tone: 'info', team: ev.team };
    case 'corner':
      return { minute, text: fill(pick(T.corner, ev.t, k), { p: n(ev.taker), team: ctx.team(ev.team) }), tone: 'info', team: ev.team };
    case 'freeKick':
      return ev.dangerous ? { minute, text: fill(pick(T.freeKickD, ev.t, k), { p: n(ev.taker), team: ctx.team(ev.team) }), tone: 'chance', team: ev.team } : null;
    case 'penalty':
      return { minute, text: fill(pick(T.penalty, ev.t, k), { team: ctx.team(ev.team), f: n(ev.fouled) }), tone: 'chance', team: ev.team };
    case 'foul':
      return hash(ev.t, k) % 3 === 0 ? { minute, text: fill(pick(T.foul, ev.t, k), { p: n(ev.player), v: n(ev.victim) }), tone: 'info', team: ev.team } : null;
    case 'card': {
      const pool = ev.color === 'yellow' ? T.yellow : ev.secondYellow ? T.second : T.red;
      return { minute, text: fill(pick(pool, ev.t, k), { p: n(ev.player), r: ev.reason, team: ctx.team(ev.team) }), tone: 'card', team: ev.team };
    }
    case 'offside':
      return { minute, text: fill(pick(T.offside, ev.t, k), { p: n(ev.player) }), tone: 'info', team: ev.team };
    case 'sub':
      return { minute, text: fill(T.sub[0], { team: ctx.team(ev.team), in: n(ev.in), out: n(ev.out) }), tone: 'info', team: ev.team };
    case 'notice':
      if (ctx.you === ev.team) return null;
      return { minute, text: fill(pick(T.notice, ev.t, k), { team: ctx.team(ev.team) }), tone: 'info', team: ev.team };
    case 'kickoff': {
      const pool = ev.period === 1 ? T.kickoff1 : ev.period === 2 ? T.kickoff2 : ev.period === 3 ? T.kickoff3 : ev.period === 4 ? T.kickoff4 : null;
      if (!pool) return null;
      if (ev.period === 1 || ev.clock % 2700 < 5 || ev.clock % 900 < 5) return { minute, text: fill(pool[0]!, { team: ctx.team(ev.team) }), tone: 'whistle' };
      return null;
    }
    case 'stoppage':
      return { minute, text: fill(T.stoppage[0], { n: String(ev.minutes) }), tone: 'whistle' };
    case 'break':
      return { minute, text: (ev.kind === 'halfTime' ? T.ht : ev.kind === 'preExtraTime' ? T.preEt : T.prePens)[0]!, tone: 'whistle' };
    case 'shootoutKick': {
      const pool = ev.outcome === 'goal' ? T.shootGoal : ev.outcome === 'saved' ? T.shootSaved : T.shootMiss;
      return { minute: 'PENS', text: fill(pool[0]!, { p: n(ev.player), a: String(ev.tally[0]), b: String(ev.tally[1]) }), tone: ev.scored ? 'goal' : 'chance', team: ev.team };
    }
    case 'fullTime': {
      const score = ev.pens ? `${ev.score[0]}–${ev.score[1]} (${ev.pens[0]}–${ev.pens[1]} pens)` : `${ev.score[0]}–${ev.score[1]}`;
      return { minute: 'FT', text: fill(pick(T.ft, ev.t, k), { team: ctx.team(ev.winner), score }), tone: 'whistle', team: ev.winner };
    }
    case 'shoutGiven': {
      const pool = ev.reaction === 'positive' ? T.shoutPos : ev.reaction === 'negative' ? T.shoutNeg : T.shoutNeu;
      return { minute, text: fill(pool[0]!, { s: SHOUT_NAME[ev.shout] ?? ev.shout }), tone: 'private', team: ev.team };
    }
    case 'teamTalk': {
      const pool = ev.reaction === 'positive' ? T.talkPos : ev.reaction === 'negative' ? T.talkNeg : T.talkNeu;
      return { minute, text: pool[0]!, tone: 'private', team: ev.team };
    }
    case 'subQueued':
      return { minute, text: fill(T.subQueued[0], { in: n(ev.in), out: n(ev.out) }), tone: 'private', team: ev.team };
    case 'subRejected':
      return { minute, text: `Substitution refused: ${ev.reason}`, tone: 'private', team: ev.team };
    case 'save':
    case 'periodEnd':
      return null;
  }
}
