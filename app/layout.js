import './globals.css'

export const metadata = {
  title: 'AI Content Editor Studio',
  description: 'Generate content with OpenAI, edit it in Tiptap, and keep the last 3 conversations in history.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
