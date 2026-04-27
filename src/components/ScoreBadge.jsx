function getColor(score) {
  if (score >= 80) return "#22c55e"
  if (score >= 60) return "#f97316"
  return "#ef4444"
}

function Badge({ label, score }) {
  const color = getColor(score)
  return (
    <span
      className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold"
      style={{ borderColor: color, color }}
    >
      {label} {score}
    </span>
  )
}

function ScoreBadge({ clarté, densité, actionabilité }) {
  const c = Number(clarté) || 0
  const d = Number(densité) || 0
  const a = Number(actionabilité) || 0
  const global = Math.round((c + d + a) / 3)
  const globalColor = getColor(global)

  return (
    <section className="flex items-center gap-3">
      <div
        className="inline-flex min-w-16 items-baseline justify-center rounded-xl border px-3 py-1"
        style={{ borderColor: globalColor, color: globalColor }}
      >
        <span className="text-3xl font-bold leading-none">{global}</span>
      </div>
      <div className="flex items-center gap-2 whitespace-nowrap">
        <Badge label="Clarté" score={c} />
        <Badge label="Densité" score={d} />
        <Badge label="Action" score={a} />
      </div>
    </section>
  )
}

export default ScoreBadge
