import { GoogleGenerativeAI } from "@google/generative-ai"
import systemPrompt from "../prompts/systemPrompt"

function getDateInMonths(months) {
  const date = new Date()
  date.setMonth(date.getMonth() + months)
  return date.toISOString().split("T")[0]
}

function parseFrontmatter(text) {
  let cleaned = text.trim()

  const fenceMatch = cleaned.match(/^```(?:yaml|markdown)?\r?\n([\s\S]*?)\r?\n```\r?\n?([\s\S]*)$/)
  if (fenceMatch) {
    const inner = fenceMatch[1].trim()
    const rest = fenceMatch[2].trim()
    const yamlMatch = inner.match(/^---\r?\n([\s\S]*?)\r?\n---$/)
    if (yamlMatch) {
      return buildMetadata(yamlMatch[1], rest)
    }
    return buildMetadata(inner, rest)
  }

  const dashMatch = cleaned.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (dashMatch) {
    return buildMetadata(dashMatch[1], dashMatch[2].trim())
  }

  return { metadata: null, body: cleaned }
}

function buildMetadata(yamlBlock, body) {
  const metadata = {}
  yamlBlock.split(/\r?\n/).forEach(line => {
    const colonIndex = line.indexOf(":")
    if (colonIndex === -1) return
    const key = line.slice(0, colonIndex).trim()
    const value = line.slice(colonIndex + 1).trim()
    if (key) metadata[key] = value
  })
  return { metadata, body }
}

function injectDates(markdownFull) {
  const today = new Date().toISOString().split("T")[0]
  const revision = getDateInMonths(6)

  if (markdownFull.includes("date-creation")) return markdownFull

  return markdownFull.replace(
    /^(---\r?\n[\s\S]*?)(statut:)/m,
    `$1date-creation: ${today}\ndate-revision: ${revision}\n$2`
  )
}

function parseScores(jsonText) {
  const cleaned = jsonText
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim()

  let parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error("Le bloc de score JSON est invalide.")
  }

  const clarté = Number(parsed?.clarté)
  const densité = Number(parsed?.densité)
  const actionabilité = Number(parsed?.actionabilité)

  if (
    !Number.isFinite(clarté) ||
    !Number.isFinite(densité) ||
    !Number.isFinite(actionabilité)
  ) {
    throw new Error(
      "Le JSON de score doit contenir des valeurs numériques pour clarté, densité et actionabilité."
    )
  }

  return { clarté, densité, actionabilité }
}

const anonymizeInstruction = `
- Anonymisation obligatoire : remplace tous les noms propres de personnes 
  par leur rôle fonctionnel entre crochets (ex: "[Responsable RH]", "[Chef de projet]", 
  "[Directeur technique]"). Cette règle s'applique à tous les noms de personnes 
  sans exception. Les noms d'outils, de produits et d'entreprises sont conservés.`

export async function generateKnowledgeCard(sourceText, anonymize = false) {
  if (!sourceText || !sourceText.trim()) {
    throw new Error("Le texte source est vide. Fournis un contenu à transformer.")
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error(
      "Clé API Gemini manquante. Définis VITE_GEMINI_API_KEY dans l'environnement."
    )
  }

  const finalPrompt = systemPrompt + (anonymize ? anonymizeInstruction : "")

  const client = new GoogleGenerativeAI(apiKey)
  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    systemInstruction: finalPrompt,
  })

  let response
  try {
    response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: sourceText }] }],
    })
  } catch (error) {
    const details =
      typeof error?.message === "string" && error.message.trim()
        ? ` Détail: ${error.message}`
        : ""
    throw new Error(`Échec de l'appel à l'API Gemini.${details}`)
  }

  const fullText = response?.response?.text?.()
  if (!fullText || !fullText.trim()) {
    throw new Error("La réponse Gemini est vide ou illisible.")
  }

  const separator = "===SCORES==="
  const separatorIndex = fullText.lastIndexOf(separator)
  if (separatorIndex === -1) {
    throw new Error(
      "Format de réponse invalide : séparateur ===SCORES=== introuvable."
    )
  }

  const markdownFull = fullText.slice(0, separatorIndex).trim()
  const scoreBlock = fullText.slice(separatorIndex + separator.length).trim()

  if (!markdownFull) throw new Error("Le Markdown généré est vide.")
  if (!scoreBlock) throw new Error("Le bloc JSON de score est vide.")

  const markdownWithDates = injectDates(markdownFull)
  const { metadata, body } = parseFrontmatter(markdownWithDates)
  const scores = parseScores(scoreBlock)

  return { markdown: markdownWithDates, body, metadata, scores }
}