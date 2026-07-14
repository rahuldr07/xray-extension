import React from 'react';
import { IconPalette } from '@tabler/icons-react';
import { usePanelStore } from '../../store';

const iconProps = { size: 16, stroke: 1.8 } as const;

// A plain header button that opens the Settings modal straight to Appearance.
// This deliberately reuses the proven modal path instead of a custom popover,
// so theme selection works identically across the panel, HUD, and pop-out window.
export function ThemeSwitcher(): React.ReactElement {
  const openSettings = usePanelStore((state) => state.openSettings);
  return (
    <button
      className="xray-icon-btn"
      title="Theme & appearance"
      aria-label="Theme and appearance"
      onClick={() => openSettings('appearance')}
    >
      <IconPalette {...iconProps} />
    </button>
  );
}
