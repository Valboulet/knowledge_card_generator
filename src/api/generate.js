import { GoogleGenerativeAI } from "@google/generative-ai"
import systemPrompt from "../prompts/systemPrompt"

function parseScores(jsonText) {
  let parsed
  try {
    parsed = JSON.parse(jsonText)
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

export async function generateKnowledgeCard(sourceText) {
  if (!sourceText || !sourceText.trim()) {
    throw new Error("Le texte source est vide. Fournis un contenu à transformer.")
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error(
      "Clé API Gemini manquante. Définis VITE_GEMINI_API_KEY dans l'environnement."
    )
  }

  const client = new GoogleGenerativeAI(apiKey)
  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: systemPrompt,
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

  const separator = "\n---\n"
  const separatorIndex = fullText.lastIndexOf(separator)
  if (separatorIndex === -1) {
    throw new Error(
      "Format de réponse invalide: séparateur --- introuvable entre Markdown et JSON."
    )
  }

  const markdown = fullText.slice(0, separatorIndex).trim()
  const scoreBlock = fullText.slice(separatorIndex + separator.length).trim()

  if (!markdown) {
    throw new Error("Le Markdown généré est vide.")
  }
  if (!scoreBlock) {
    throw new Error("Le bloc JSON de score est vide.")
  }

  const scores = parseScores(scoreBlock)

  return { markdown, scores }
}
