import React from 'react';
import {
  IconBrandTypescript,
  IconChartBar,
  IconCircleCheck,
  IconNetwork,
  IconSettings,
  IconTerminal2,
} from '@tabler/icons-react';
import type { ActiveTab } from '../../types';

export const iconProps = { size: 16, stroke: 1.8 } as const;

export const panelTabs: Array<{ id: ActiveTab; label: string; icon: React.ReactNode }> = [
  { id: 'console', label: 'Console', icon: <IconTerminal2 {...iconProps} /> },
  { id: 'api', label: 'API', icon: <IconNetwork {...iconProps} /> },
  { id: 'logs', label: 'Logs', icon: <IconCircleCheck {...iconProps} /> },
  { id: 'notebook', label: 'Notebook', icon: <IconBrandTypescript {...iconProps} /> },
  { id: 'insights', label: 'Insights', icon: <IconChartBar {...iconProps} /> },
  { id: 'settings', label: 'Settings', icon: <IconSettings {...iconProps} /> },
];
