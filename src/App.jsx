import { useState } from 'react'
import { generateKnowledgeCard } from './api/generate'
import CardDisplay from './components/CardDisplay'
import CardForm from './components/CardForm'

function App() {
  const [sourceText, setSourceText] = useState('')
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [anonymize, setAnonymize] = useState(false)

  async function handleGenerate(nextSourceText) {
    if (!nextSourceText.trim()) return
    setError('')
    setIsLoading(true)
    try {
      const generated = await generateKnowledgeCard(nextSourceText, anonymize)
      setResult(generated)
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : 'Une erreur est survenue pendant la génération.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Knowledge Card Generator
          </h1>
          <p className="max-w-3xl text-sm text-slate-600 sm:text-base">
            Transformez vos contenus de formation en cartes opérationnelles pour consultants
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <CardForm
              sourceText={sourceText}
              onSourceTextChange={setSourceText}
              onSubmit={handleGenerate}
              isLoading={isLoading}
              anonymize={anonymize}
              onAnonymizeChange={setAnonymize}
            />
            {error ? (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            {result ? (
              <CardDisplay
                markdown={result.markdown}
                body={result.body}
                metadata={result.metadata}
                scores={result.scores}
              />
            ) : (
              <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-slate-300 bg-white px-6 text-center">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-10 w-10 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="M7 4h7l5 5v11a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
                  <path d="M14 4v5h5" />
                  <path d="M9 13h6M9 17h6" />
                </svg>
                <p className="text-base font-medium text-slate-700">
                  Votre knowledge card apparaîtra ici
                </p>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  )
}

export default App