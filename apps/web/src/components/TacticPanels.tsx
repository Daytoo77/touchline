import { DUTY_LABEL, FORMATIONS, FORMATION_IDS, ROLES, rolesForPosition, type Club, type FormationId, type Instructions, type Tactic } from '@touchline/shared';
import { setRole } from '../lib/sheet';

export function Seg<T extends number | string>(props: { value: T; options: { v: T; label: string }[]; onChange(v: T): void; label?: string }) {
  return (
    <div className="seg" role="radiogroup" aria-label={props.label}>
      {props.options.map((o) => (
        <button key={String(o.v)} role="radio" aria-checked={o.v === props.value} className={o.v === props.value ? 'on' : ''} onClick={() => props.onChange(o.v)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function FormationSelect(props: { value: FormationId; onChange(f: FormationId): void }) {
  return (
    <select className="input" aria-label="Formation" value={props.value} onChange={(e) => props.onChange(e.target.value as FormationId)}>
      {FORMATION_IDS.map((f) => (
        <option key={f} value={f}>
          {FORMATIONS[f].name}
        </option>
      ))}
    </select>
  );
}

export function RolesPanel(props: { club: Club; tactic: Tactic; onChange(t: Tactic): void }) {
  const { club, tactic } = props;
  const f = FORMATIONS[tactic.formation];
  return (
    <div className="stack">
      {f.slots.map((slot, i) => {
        const s = tactic.slots[i]!;
        const p = club.players.find((q) => q.id === s.playerId);
        const roles = rolesForPosition(slot.pos);
        const role = ROLES[s.role];
        return (
          <div key={i} className="card stack" style={{ padding: 10, gap: 8 }}>
            <div className="row">
              <span className="pill">{slot.pos}</span>
              <strong className="grow" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p ? p.name : '—'}
              </strong>
            </div>
            <div className="row">
              <select className="input grow" aria-label={`Role for ${slot.pos}`} value={s.role} onChange={(e) => props.onChange(setRole(tactic, i, e.target.value as never))}>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <div style={{ width: 150 }}>
                <Seg value={s.duty} label="Duty" options={role.duties.map((d) => ({ v: d, label: DUTY_LABEL[d] }))} onChange={(d) => props.onChange(setRole(tactic, i, s.role, d))} />
              </div>
            </div>
            <div className="muted small">{role.description}</div>
          </div>
        );
      })}
    </div>
  );
}

const I5 = (labels: string[]) => labels.map((label, i) => ({ v: i - 2, label }));

export const INSTRUCTION_FIELDS: { key: keyof Instructions; title: string; options: { v: number; label: string }[]; long: string[] }[] = [
  {
    key: 'mentality',
    title: 'Mentality',
    options: ['V.Def', 'Def', 'Caut', 'Bal', 'Pos', 'Att', 'V.Att'].map((label, i) => ({ v: i - 3, label })),
    long: ['Very Defensive', 'Defensive', 'Cautious', 'Balanced', 'Positive', 'Attacking', 'Very Attacking'],
  },
  { key: 'pressing', title: 'Pressing intensity', options: I5(['−−', '−', 'Std', '+', '++']), long: ['Much Less', 'Less', 'Standard', 'More', 'Much More'] },
  { key: 'line', title: 'Defensive line', options: I5(['−−', '−', 'Std', '+', '++']), long: ['Much Deeper', 'Deeper', 'Standard', 'Higher', 'Much Higher'] },
  { key: 'width', title: 'Width in possession', options: I5(['−−', '−', 'Std', '+', '++']), long: ['Very Narrow', 'Narrow', 'Standard', 'Wide', 'Very Wide'] },
  { key: 'tempo', title: 'Tempo', options: I5(['−−', '−', 'Std', '+', '++']), long: ['Much Lower', 'Lower', 'Standard', 'Higher', 'Much Higher'] },
  { key: 'directness', title: 'Passing directness', options: I5(['−−', '−', 'Mix', '+', '++']), long: ['Much Shorter', 'Shorter', 'Mixed', 'More Direct', 'Much More Direct'] },
  {
    key: 'timeWasting',
    title: 'Time-wasting',
    options: ['Never', 'Rarely', 'Some', 'Often', 'Always'].map((label, i) => ({ v: i, label })),
    long: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
  },
];

export function InstructionsPanel(props: { value: Instructions; onChange(v: Instructions): void }) {
  return (
    <div className="stack" style={{ gap: 14 }}>
      {INSTRUCTION_FIELDS.map((f) => {
        const v = props.value[f.key];
        const idx = f.options.findIndex((o) => o.v === v);
        return (
          <div key={f.key} className="field">
            <label>
              <span>{f.title}</span>
              <span style={{ color: 'var(--text)' }}>{f.long[idx]}</span>
            </label>
            <Seg value={v} label={f.title} options={f.options} onChange={(nv) => props.onChange({ ...props.value, [f.key]: nv })} />
          </div>
        );
      })}
    </div>
  );
}

const SP_FIELDS: { key: keyof Tactic['setPieces']; title: string }[] = [
  { key: 'captain', title: 'Captain' },
  { key: 'penalty', title: 'Penalty taker' },
  { key: 'freeKick', title: 'Direct free kicks' },
  { key: 'cornerLeft', title: 'Corners (left)' },
  { key: 'cornerRight', title: 'Corners (right)' },
];

export function SetPiecesPanel(props: { club: Club; tactic: Tactic; onChange(t: Tactic): void }) {
  const xi = props.tactic.slots.map((s) => props.club.players.find((p) => p.id === s.playerId)).filter((p): p is NonNullable<typeof p> => !!p);
  return (
    <div className="stack" style={{ gap: 14 }}>
      {SP_FIELDS.map((f) => (
        <div key={f.key} className="field">
          <label htmlFor={`sp-${f.key}`}>{f.title}</label>
          <select
            id={`sp-${f.key}`}
            className="input"
            value={props.tactic.setPieces[f.key]}
            onChange={(e) => props.onChange({ ...props.tactic, setPieces: { ...props.tactic.setPieces, [f.key]: e.target.value } })}
          >
            {xi.map((p) => (
              <option key={p.id} value={p.id}>
                {p.number}. {p.name}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
