export const PLATFORM_OPTIONS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'website', label: 'Website' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter', label: 'X / Twitter' },
]

export const TONE_OPTIONS = ['professional', 'casual', 'engaging', 'persuasive', 'friendly']
export const LENGTH_OPTIONS = ['short', 'medium', 'long']

const PLATFORM_RULES = {
  linkedin:
    'Write for LinkedIn in a professional, thoughtful, polished style. Make it easy to scan and strong enough to post directly after editing.',
  instagram:
    'Write a catchy and engaging Instagram caption. Keep the flow natural and easy to edit, with optional line breaks if they help readability.',
  youtube:
    'Write for YouTube. Include a strong title and a useful description when the request suggests both.',
  website:
    'Write polished website-ready copy with clear structure, clarity, and a customer-friendly tone.',
  facebook:
    'Write friendly, readable Facebook copy that feels human and conversational.',
  twitter:
    'Write concise X/Twitter copy that is crisp, clear, and impactful.',
}

const LENGTH_RULES = {
  short: 'Keep the output concise and tight.',
  medium: 'Keep the output balanced with moderate detail.',
  long: 'Make the output detailed, but still clean and editable.',
}

export function buildSystemPrompt() {
  return [
    'You are an expert content-writing assistant inside a rich text editor application.',
    'Generate clean first drafts that users can directly edit in the editor.',
    'Return only the final editable content.',
    'Do not add explanations, labels, or prefaces.',
    'Do not wrap the answer in quotation marks.',
    'Use headings or bullets only when they actually fit the requested format.',
  ].join(' ')
}

export function buildUserPrompt(payload) {
  return [
    `Platform: ${payload.platform}`,
    `Tone: ${payload.tone}`,
    `Length: ${payload.length}`,
    `Audience: ${payload.audience || 'General audience'}`,
    `Platform rule: ${PLATFORM_RULES[payload.platform]}`,
    `Length rule: ${LENGTH_RULES[payload.length]}`,
    '',
    'User request:',
    payload.prompt,
    '',
    'Generate one strong editable draft.',
  ].join('\n')
}

export function buildRewritePrompt({ instruction, currentContent, platform, tone }) {
  return [
    `Platform: ${platform}`,
    `Current tone: ${tone}`,
    `Rewrite instruction: ${instruction}`,
    '',
    'Current content:',
    currentContent,
    '',
    'Rewrite the content and return only the improved editable result.',
  ].join('\n')
}
