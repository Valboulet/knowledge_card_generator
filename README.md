# Knowledge Card Generator

POC de génération automatique de knowledge cards structurées pour agents IA et consultants métier.

## Concept

Transforme n'importe quelle source de contenu (formation, transcript, retour d'expérience, propale) en knowledge card au format Markdown + frontmatter YAML, optimisée pour le RAG et lisible par un humain.

## Fonctionnalités

- Import multi-formats : PDF, DOCX, PPTX, XLSX, CSV, HTML, TXT, MD
- Glisser-déposer ou sélection de fichier
- Génération structurée via LLM (Gemini 2.5 Flash Lite)
- Format de sortie : Markdown + frontmatter YAML (optimisé RAG)
- Anonymisation optionnelle des noms propres
- Scores de qualité : clarté, densité, actionabilité
- Affichage des métadonnées : domaine, niveau, confiance, résumé agent
- Copie du Markdown complet (avec YAML) en un clic

## Structure d'une knowledge card

```yaml
---
domaine: [détecté automatiquement]
sous-domaine: [précision]
niveau: junior | confirmé | senior
tags: [tag1, tag2, tag3]
prerequis: [concept1, concept2]
statut: brouillon
confiance: [1-5]
resume-agent: [1 phrase pour le retrieval sémantique]
---
```

Suivi du corps Markdown en 6 sections :
- Essence
- Concepts clés
- Pourquoi ça compte en mission
- Pièges et nuances
- Vocabulaire métier
- Questions probables

## Stack technique

- Vite + React
- Tailwind CSS
- Google Gemini API (gemini-2.5-flash-lite)
- mammoth (extraction DOCX)
- pdfjs-dist (extraction PDF)
- jszip (extraction PPTX)
- xlsx (extraction Excel)

## Installation

```bash
npm install
```

## Configuration

Crée un fichier `.env` à la racine :

VITE_GEMINI_API_KEY=ta_clé_api_gemini

## Lancement

```bash
npm run dev
```

## Utilisation

1. Glisse un fichier dans la zone de dépôt ou colle du texte
2. Active "Anonymiser" si le contenu contient des noms propres à masquer
3. Clique sur "Générer la Knowledge Card"
4. Copie le Markdown généré pour le stocker dans SharePoint ou ta base RAG