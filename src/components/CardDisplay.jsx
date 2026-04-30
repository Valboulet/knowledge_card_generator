import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import ScoreBadge from "./ScoreBadge"

function RevisionBadge({ date }) {
  const today = new Date()
  const revision = new Date(date)
  const diffDays = Math.ceil((revision - today) / (1000 * 60 * 60 * 24))

  let className = "rounded-full px-3 py-1 text-xs font-medium "
  let label = `révision le ${date}`

  if (diffDays < 0) {
    className += "bg-red-50 text-red-600"
    label = `⚠ révision dépassée (${date})`
  } else if (diffDays <= 30) {
    className += "bg-amber-50 text-amber-600"
    label = `révision dans ${diffDays}j (${date})`
  } else {
    className += "bg-slate-100 text-slate-500"
  }

  return <span className={className}>{label}</span>
}

function CardDisplay({ markdown, body, metadata, scores }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!markdown) return
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-start justify-between gap-4">
        <ScoreBadge
          clarté={scores?.clarté ?? 0}
          densité={scores?.densité ?? 0}
          actionabilité={scores?.actionabilité ?? 0}
        />
        <button
          type="button"
          onClick={handleCopy}
          disabled={!markdown}
          className="rounded-full border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {copied ? "Copié ✓" : "Copier le Markdown"}
        </button>
      </div>

      {metadata && (
        <div className="mb-4 flex flex-wrap gap-2">
          {metadata.domaine && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {metadata.domaine}
            </span>
          )}
          {metadata["sous-domaine"] && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {metadata["sous-domaine"]}
            </span>
          )}
          {metadata.niveau && (
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
              {metadata.niveau}
            </span>
          )}
          {metadata.confiance && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
              confiance {metadata.confiance}/5
            </span>
          )}
          {metadata["date-creation"] && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
              créée le {metadata["date-creation"]}
            </span>
          )}
          {metadata["date-revision"] && (
            <RevisionBadge date={metadata["date-revision"]} />
          )}
        </div>
      )}

      {metadata?.["resume-agent"] && (
        <div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm text-indigo-700">
          <span className="font-medium">Résumé agent : </span>
          {metadata["resume-agent"]}
        </div>
      )}

      <div
        className="prose max-w-none text-[15px] leading-7 text-slate-700 overflow-hidden break-words
        prose-h2:mb-3 prose-h2:mt-8 prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-2 prose-h2:text-xl prose-h2:font-bold prose-h2:text-slate-900
        prose-p:my-3 prose-ul:my-4 prose-ol:my-4 prose-li:my-1.5"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {body || markdown || "_La card générée apparaîtra ici._"}
        </ReactMarkdown>
      </div>
    </section>
  )
}

export default CardDisplay