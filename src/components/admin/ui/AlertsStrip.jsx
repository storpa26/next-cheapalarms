export function AlertsStrip({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="mb-4 rounded-lg border border-yellow-300/40 bg-yellow-100/50 p-3 text-sm text-yellow-900">
      <ul className="list-disc pl-5">
        {items.map((a, i) => (
          <li key={i}>
            <span className="font-medium">{a.title}</span>
            {a.description ? <span className="text-yellow-900/80"> — {a.description}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}


