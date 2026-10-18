import type { AiSettings, PanelAccent, PanelDensity, PanelFont } from '../types';

export interface LabelledOption<T extends string = string> { value: T; label: string }

// Select options show names, not stored ids (S7). Fonts fall back to the next
// family in the stack when not installed, hence "(if installed)".
export const FONT_OPTIONS: Array<LabelledOption<PanelFont>> = [
  { value: 'jetbrains', label: 'JetBrains Mono (if installed)' },
  { value: 'cascadia', label: 'Cascadia Code (if installed)' },
  { value: 'iosevka', label: 'Iosevka (if installed)' },
  { value: 'system', label: 'System monospace' },
];

export const DENSITY_OPTIONS: Array<LabelledOption<PanelDensity>> = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'spacious', label: 'Spacious' },
];

export const AI_PROVIDER_OPTIONS: Array<LabelledOption<AiSettings['provider']>> = [
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'custom', label: 'Custom (OpenAI-compatible)' },
];

// The persisted ids are historical (`blue` is amber, `peach` is gold); the display
// names describe the colour actually painted (PANEL_ACCENT_VALUES).
export const ACCENT_NAMES: Record<PanelAccent, string> = {
  blue: 'Amber',
  mauve: 'Lavender',
  teal: 'Teal',
  green: 'Green',
  peach: 'Gold',
  coral: 'Coral',
};
