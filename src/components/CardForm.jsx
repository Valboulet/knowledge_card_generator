import { useState, useRef } from "react"

function CardForm({ sourceText, onSourceTextChange, onSubmit, isLoading, anonymize, onAnonymizeChange }) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileError, setFileError] = useState("")
  const fileInputRef = useRef(null)

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(sourceText)
  }

  async function extractTextFromFile(file) {
    const ext = file.name.split(".").pop().toLowerCase()

    if (ext === "txt" || ext === "md") {
      return await file.text()
    }

    if (ext === "html" || ext === "htm") {
      const raw = await file.text()
      const doc = new DOMParser().parseFromString(raw, "text/html")
      return doc.body.innerText || doc.body.textContent || ""
    }

    if (ext === "docx") {
      const mammoth = await import("mammoth")
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      return result.value
    }

    if (ext === "pptx") {
      const JSZip = (await import("jszip")).default
      const arrayBuffer = await file.arrayBuffer()
      const zip = await JSZip.loadAsync(arrayBuffer)
      const slideFiles = Object.keys(zip.files)
        .filter((name) => name.match(/^ppt\/slides\/slide[0-9]+\.xml$/))
        .sort()
      let text = ""
      for (const slideName of slideFiles) {
        const xml = await zip.files[slideName].async("string")
        const doc = new DOMParser().parseFromString(xml, "text/xml")
        const nodes = doc.querySelectorAll("t")
        const slideText = Array.from(nodes)
          .map((n) => n.textContent)
          .filter(Boolean)
          .join(" ")
        if (slideText.trim()) text += slideText + "\n\n"
      }
      return text
    }

    if (ext === "xlsx" || ext === "xls" || ext === "csv") {
      if (ext === "csv") {
        return await file.text()
      }
      const XLSX = await import("xlsx")
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: "array" })
      let text = ""
      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName]
        const csv = XLSX.utils.sheet_to_csv(sheet)
        if (csv.trim()) text += `[${sheetName}]\n${csv}\n\n`
      })
      return text
    }

    if (ext === "pdf") {
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs")
      const workerSrc = new URL(
        "pdfjs-dist/legacy/build/pdf.worker.mjs",
        import.meta.url
      ).href
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      let text = ""
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        text += content.items.map((item) => item.str).join(" ") + "\n"
      }
      return text
    }

    throw new Error(`Format non supporté : .${ext}`)
  }

  async function handleFile(file) {
    setFileError("")
    const allowed = ["txt", "md", "docx", "pdf", "pptx", "xlsx", "xls", "csv", "html", "htm"]
    const ext = file.name.split(".").pop().toLowerCase()
    if (!allowed.includes(ext)) {
      setFileError("Format non supporté. Acceptés : TXT, MD, DOCX, PDF, PPTX, XLSX, CSV, HTML.")
      return
    }
    try {
      const text = await extractTextFromFile(file)
      if (!text.trim()) {
        setFileError("Le fichier semble vide ou illisible.")
        return
      }
      onSourceTextChange(text)
    } catch (err) {
      setFileError(err.message || "Erreur lors de la lecture du fichier.")
    }
  }

  function handleDragOver(event) {
    event.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  async function handleDrop(event) {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) await handleFile(file)
  }

  async function handleFileInput(event) {
    const file = event.target.files[0]
    if (file) await handleFile(file)
    event.target.value = ""
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !sourceText && fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 text-center transition
          ${isDragging
            ? "border-indigo-400 bg-indigo-50"
            : "border-slate-300 bg-white hover:border-slate-400"
          }`}
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M7 4h7l5 5v11a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
          <path d="M14 4v5h5M9 13h6M9 17h6" />
        </svg>
        <p className="text-sm font-medium text-slate-600">
          Glissez un fichier ici
        </p>
        <p className="text-xs text-slate-400">
          TXT · MD · DOCX · PDF · PPTX · XLSX · CSV · HTML
        </p>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
          className="mt-1 rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:border-slate-400 hover:text-slate-800"
        >
          Ou parcourir
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.docx,.pdf,.pptx,.xlsx,.xls,.csv,.html,.htm"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {fileError && (
        <p className="text-xs text-red-500">{fileError}</p>
      )}

      <div className="relative">
        <textarea
          value={sourceText}
          onChange={(event) => onSourceTextChange(event.target.value)}
          placeholder="Ou collez directement votre texte source ici..."
          className="min-h-[160px] w-full rounded-xl border border-slate-300 bg-white p-4 pb-9 text-slate-900 outline-none ring-indigo-400 placeholder:text-slate-400 focus:ring-2"
        />
        <span className="pointer-events-none absolute bottom-3 right-3 text-xs text-slate-400">
          {sourceText.length}
        </span>
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300">
        <div className="relative">
          <input
            type="checkbox"
            checked={anonymize}
            onChange={(e) => onAnonymizeChange(e.target.checked)}
            className="sr-only"
          />
          <div className={`h-5 w-9 rounded-full transition ${anonymize ? "bg-indigo-500" : "bg-slate-200"}`} />
          <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${anonymize ? "translate-x-4" : "translate-x-0.5"}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">Anonymiser</p>
          <p className="text-xs text-slate-400">Remplace les noms propres par leurs rôles</p>
        </div>
      </label>

      <button
        type="submit"
        disabled={isLoading || !sourceText.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Génération en cours...
          </>
        ) : (
          "Générer la Knowledge Card"
        )}
      </button>
    </form>
  )
}

export default CardForm