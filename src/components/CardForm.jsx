function CardForm({ sourceText, onSourceTextChange, onSubmit, isLoading }) {
  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(sourceText)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="relative">
        <textarea
          value={sourceText}
          onChange={(event) => onSourceTextChange(event.target.value)}
          placeholder="Collez ici votre texte source : formation, transcript, retour d'expérience, documentation..."
          className="min-h-[200px] w-full rounded-xl border border-slate-300 bg-white p-4 pb-9 text-slate-900 outline-none ring-indigo-400 placeholder:text-slate-400 focus:ring-2"
        />
        <span className="pointer-events-none absolute bottom-3 right-3 text-xs text-slate-400">
          {sourceText.length}
        </span>
      </div>
      <button
        type="submit"
        disabled={isLoading}
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
