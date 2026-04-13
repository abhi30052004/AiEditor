# AI Content Editor Studio

A colorful JavaScript + React + Next.js content editor that:

- generates drafts with OpenAI
- inserts the response directly into a Tiptap editor
- lets the user edit the content immediately
- saves the last 3 generated conversations in a sidebar
- offers quick rewrite suggestions like shorter, professional tone, CTA, and hashtags

## Run locally

1. Install dependencies

```bash
npm install
```

2. Create `.env.local`

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

3. Start the app

```bash
npm run dev
```

## Main features

- Pure JavaScript project files
- React state + `useEffect`
- OpenAI powered `/api/generate` route
- OpenAI powered `/api/rewrite` route for suggestion chips
- Rich Tiptap editor with toolbar actions such as bold, italic, strike, headings, lists, quote, undo, and redo
- Local history of the latest 3 generated results
