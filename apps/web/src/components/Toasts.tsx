import { useMatch } from '../matchStore';

export function Toasts() {
  const toasts = useMatch((s) => s.toasts);
  const inBreak = useMatch((s) => s.pub?.phase === 'break');
  if (inBreak) return null;
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.tone}`}>
          {t.text}
        </div>
      ))}
    </div>
  );
}
