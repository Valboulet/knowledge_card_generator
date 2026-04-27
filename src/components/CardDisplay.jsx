import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import ScoreBadge from "./ScoreBadge"

function CardDisplay({ markdown, scores }) {
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
      <div
        className="prose max-w-none text-[15px] leading-7 text-slate-700
        prose-h2:mb-3 prose-h2:mt-8 prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-2 prose-h2:text-xl prose-h2:font-bold prose-h2:text-slate-900
        prose-p:my-3 prose-ul:my-4 prose-ol:my-4 prose-li:my-1.5"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {markdown || "_La card générée apparaîtra ici._"}
        </ReactMarkdown>
      </div>
    </section>
  )
}

export default CardDisplay
