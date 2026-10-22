export type ExperienceState = { scroll: number; pointerX: number; pointerY: number; reduced: boolean; mobile: boolean };

export const scenePalette = {
  graphite: '#35393c', edge: '#81898e', lens: '#b9d6da', optical: '#a7d8e8',
  dark: '#070809', white: '#f3f1ec', sky: '#8b9fa5', mountain: '#64796d',
  farMountain: '#899590', water: '#81999d', circuit: '#47665b', black: '#111315',
};

export const interactions = [
  { title: 'Understand an object', question: 'What am I looking at?', reply: 'Let me take a closer look.', label: 'LANDSCAPE RECOGNIZED', result: 'An alpine lake, shaped by glacial movement. The pale bands along the shore reveal changing water levels.' },
  { title: 'Translate a conversation', question: 'Can you translate that for me?', reply: 'Of course. I’m listening.', label: 'FRENCH → ENGLISH', result: '“The path along the lake leads to the village. It’s a beautiful walk from here.”' },
  { title: 'Get navigation assistance', question: 'Which way to the lake?', reply: 'Let’s find your way.', label: 'ROUTE IN VIEW', result: 'Follow the shoreline to your left. Stay on the marked trail toward the water.' },
];

export function journeyUrl(value: string | undefined): string | null {
  if (!value) return null;
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; } catch { return null; }
}