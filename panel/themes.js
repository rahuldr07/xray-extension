// panel/themes.js — Premium macOS-inspired theme palettes
// Inspired by: macOS Sonoma, Linear, Vercel, Raycast, Arc Browser
window.XRAY_Themes = {
  'zinc': {
    name: 'Zinc Dark',
    dot: '#a1a1aa',
    vars: {
      // Base layers (depth system)
      '--xr-bg':       '#09090b',
      '--xr-bg2':      '#131316',
      '--xr-bg3':      '#1c1c21',
      '--xr-surface':  '#27272a',
      '--xr-elevated': '#323238',
      '--xr-overlay':  '#3f3f46',

      // Text hierarchy (SF Pro inspired)
      '--xr-text':     '#fafafa',
      '--xr-subtext':  '#b4b4b4',
      '--xr-muted':    '#737373',
      '--xr-faint':    '#525252',

      // Accent system (macOS blue)
      '--xr-accent':       '#3b82f6',
      '--xr-accent-hover': '#60a5fa',
      '--xr-accent-muted': 'rgba(59, 130, 246, 0.12)',
      '--xr-accent-ring':  'rgba(59, 130, 246, 0.25)',

      // Semantic colors (vibrant but balanced)
      '--xr-success':  '#22c55e',
      '--xr-success-muted': 'rgba(34, 197, 94, 0.12)',
      '--xr-warning':  '#f59e0b',
      '--xr-warning-muted': 'rgba(245, 158, 11, 0.12)',
      '--xr-error':    '#ef4444',
      '--xr-error-muted': 'rgba(239, 68, 68, 0.12)',
      '--xr-info':     '#0ea5e9',
      '--xr-info-muted': 'rgba(14, 165, 233, 0.12)',

      // Method colors (distinct, accessible)
      '--xr-blue':     '#3b82f6',
      '--xr-green':    '#22c55e',
      '--xr-red':      '#ef4444',
      '--xr-yellow':   '#f59e0b',
      '--xr-orange':   '#f97316',
      '--xr-purple':   '#a855f7',
      '--xr-cyan':     '#06b6d4',
      '--xr-pink':     '#ec4899',

      // Borders & separators
      '--xr-border':       'rgba(255, 255, 255, 0.06)',
      '--xr-border-hover': 'rgba(255, 255, 255, 0.12)',
      '--xr-border-active':'rgba(255, 255, 255, 0.18)',
      '--xr-ring':         '#52525b',
      '--xr-divider':      'rgba(255, 255, 255, 0.04)',

      // Shadows (macOS-style layered)
      '--xr-shadow-sm':    '0 1px 2px rgba(0, 0, 0, 0.4)',
      '--xr-shadow':       '0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.4)',
      '--xr-shadow-lg':    '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3)',
      '--xr-shadow-xl':    '0 16px 64px rgba(0, 0, 0, 0.5), 0 8px 24px rgba(0, 0, 0, 0.3)',

      // Radii (consistent system)
      '--xr-radius-xs':  '3px',
      '--xr-radius-sm':  '4px',
      '--xr-radius':     '6px',
      '--xr-radius-md':  '8px',
      '--xr-radius-lg':  '10px',
      '--xr-radius-xl':  '12px',
      '--xr-radius-2xl': '16px',
      '--xr-radius-full':'9999px',

      // Transitions (spring-like)
      '--xr-transition-fast':   '0.1s cubic-bezier(0.4, 0, 0.2, 1)',
      '--xr-transition':        '0.15s cubic-bezier(0.4, 0, 0.2, 1)',
      '--xr-transition-slow':   '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      '--xr-spring':            '0.4s cubic-bezier(0.16, 1, 0.3, 1)',

      // Blur (glassmorphism)
      '--xr-blur':        '12px',
      '--xr-blur-sm':     '8px',
      '--xr-blur-lg':     '20px',

      // Status dot colors (semantic)
      '--xr-dot-success': '#22c55e',
      '--xr-dot-warning': '#f59e0b',
      '--xr-dot-error':   '#ef4444',
      '--xr-dot-info':    '#3b82f6',
      '--xr-dot-muted':   '#525252',
    }
  },
  'mocha': {
    name: 'Catppuccin Mocha',
    dot: '#cba6f7',
    vars: {
      '--xr-bg':       '#11111b',
      '--xr-bg2':      '#181825',
      '--xr-bg3':      '#1e1e2e',
      '--xr-surface':  '#313244',
      '--xr-elevated': '#45475a',
      '--xr-overlay':  '#585b70',

      '--xr-text':     '#cdd6f4',
      '--xr-subtext':  '#bac2de',
      '--xr-muted':    '#6c7086',
      '--xr-faint':    '#45475a',

      '--xr-accent':       '#cba6f7',
      '--xr-accent-hover': '#d6b4fc',
      '--xr-accent-muted': 'rgba(203, 166, 247, 0.12)',
      '--xr-accent-ring':  'rgba(203, 166, 247, 0.25)',

      '--xr-success':  '#a6e3a1',
      '--xr-success-muted': 'rgba(166, 227, 161, 0.12)',
      '--xr-warning':  '#f9e2af',
      '--xr-warning-muted': 'rgba(249, 226, 175, 0.12)',
      '--xr-error':    '#f38ba8',
      '--xr-error-muted': 'rgba(243, 139, 168, 0.12)',
      '--xr-info':     '#89b4fa',
      '--xr-info-muted': 'rgba(137, 180, 250, 0.12)',

      '--xr-blue':     '#89b4fa',
      '--xr-green':    '#a6e3a1',
      '--xr-red':      '#f38ba8',
      '--xr-yellow':   '#f9e2af',
      '--xr-orange':   '#fab387',
      '--xr-purple':   '#cba6f7',
      '--xr-cyan':     '#94e2d5',
      '--xr-pink':     '#f5c2e7',

      '--xr-border':       'rgba(205, 214, 244, 0.06)',
      '--xr-border-hover': 'rgba(205, 214, 244, 0.12)',
      '--xr-border-active':'rgba(205, 214, 244, 0.18)',
      '--xr-ring':     '#45475a',
      '--xr-divider':  'rgba(205, 214, 244, 0.04)',

      '--xr-shadow-sm':    '0 1px 2px rgba(0, 0, 0, 0.5)',
      '--xr-shadow':       '0 2px 8px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.5)',
      '--xr-shadow-lg':    '0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.4)',
      '--xr-shadow-xl':    '0 16px 64px rgba(0, 0, 0, 0.6), 0 8px 24px rgba(0, 0, 0, 0.4)',

      '--xr-radius-xs':  '3px',
      '--xr-radius-sm':  '4px',
      '--xr-radius':     '6px',
      '--xr-radius-md':  '8px',
      '--xr-radius-lg':  '10px',
      '--xr-radius-xl':  '12px',
      '--xr-radius-2xl': '16px',
      '--xr-radius-full':'9999px',

      '--xr-transition-fast':   '0.1s cubic-bezier(0.4, 0, 0.2, 1)',
      '--xr-transition':        '0.15s cubic-bezier(0.4, 0, 0.2, 1)',
      '--xr-transition-slow':   '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      '--xr-spring':            '0.4s cubic-bezier(0.16, 1, 0.3, 1)',

      '--xr-blur':        '12px',
      '--xr-blur-sm':     '8px',
      '--xr-blur-lg':     '20px',

      '--xr-dot-success': '#a6e3a1',
      '--xr-dot-warning': '#f9e2af',
      '--xr-dot-error':   '#f38ba8',
      '--xr-dot-info':    '#89b4fa',
      '--xr-dot-muted':   '#45475a',
    }
  },
  'latte': {
    name: 'Catppuccin Latte',
    dot: '#dc8a78',
    vars: {
      '--xr-bg':       '#eff1f5',
      '--xr-bg2':      '#e6e9ef',
      '--xr-bg3':      '#dce0e8',
      '--xr-surface':  '#ccd0da',
      '--xr-elevated': '#bcc0cc',
      '--xr-overlay':  '#acb0be',

      '--xr-text':     '#4c4f69',
      '--xr-subtext':  '#5c5f77',
      '--xr-muted':    '#7c7f93',
      '--xr-faint':    '#9ca0b0',

      '--xr-accent':       '#8839ef',
      '--xr-accent-hover': '#9b4dff',
      '--xr-accent-muted': 'rgba(136, 57, 239, 0.12)',
      '--xr-accent-ring':  'rgba(136, 57, 239, 0.25)',

      '--xr-success':  '#40a02b',
      '--xr-success-muted': 'rgba(64, 160, 43, 0.12)',
      '--xr-warning':  '#df8e1d',
      '--xr-warning-muted': 'rgba(223, 142, 29, 0.12)',
      '--xr-error':    '#d20f39',
      '--xr-error-muted': 'rgba(210, 15, 57, 0.12)',
      '--xr-info':     '#1e66f5',
      '--xr-info-muted': 'rgba(30, 102, 245, 0.12)',

      '--xr-blue':     '#1e66f5',
      '--xr-green':    '#40a02b',
      '--xr-red':      '#d20f39',
      '--xr-yellow':   '#df8e1d',
      '--xr-orange':   '#fe640b',
      '--xr-purple':   '#8839ef',
      '--xr-cyan':     '#04a5e5',
      '--xr-pink':     '#ea76cb',

      '--xr-border':       'rgba(76, 79, 105, 0.12)',
      '--xr-border-hover': 'rgba(76, 79, 105, 0.2)',
      '--xr-border-active':'rgba(76, 79, 105, 0.3)',
      '--xr-ring':     '#bcc0cc',
      '--xr-divider':  'rgba(76, 79, 105, 0.08)',

      '--xr-shadow-sm':    '0 1px 2px rgba(76, 79, 105, 0.08)',
      '--xr-shadow':       '0 2px 8px rgba(76, 79, 105, 0.08), 0 1px 2px rgba(76, 79, 105, 0.06)',
      '--xr-shadow-lg':    '0 8px 32px rgba(76, 79, 105, 0.12), 0 2px 8px rgba(76, 79, 105, 0.08)',
      '--xr-shadow-xl':    '0 16px 64px rgba(76, 79, 105, 0.15), 0 8px 24px rgba(76, 79, 105, 0.1)',

      '--xr-radius-xs':  '3px',
      '--xr-radius-sm':  '4px',
      '--xr-radius':     '6px',
      '--xr-radius-md':  '8px',
      '--xr-radius-lg':  '10px',
      '--xr-radius-xl':  '12px',
      '--xr-radius-2xl': '16px',
      '--xr-radius-full':'9999px',

      '--xr-transition-fast':   '0.1s cubic-bezier(0.4, 0, 0.2, 1)',
      '--xr-transition':        '0.15s cubic-bezier(0.4, 0, 0.2, 1)',
      '--xr-transition-slow':   '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      '--xr-spring':            '0.4s cubic-bezier(0.16, 1, 0.3, 1)',

      '--xr-blur':        '12px',
      '--xr-blur-sm':     '8px',
      '--xr-blur-lg':     '20px',

      '--xr-dot-success': '#40a02b',
      '--xr-dot-warning': '#df8e1d',
      '--xr-dot-error':   '#d20f39',
      '--xr-dot-info':    '#1e66f5',
      '--xr-dot-muted':   '#9ca0b0',
    }
  },
  'dracula': {
    name: 'Dracula',
    dot: '#bd93f9',
    vars: {
      '--xr-bg':       '#171920',
      '--xr-bg2':      '#21222c',
      '--xr-bg3':      '#282a36',
      '--xr-surface':  '#343746',
      '--xr-elevated': '#44475a',
      '--xr-overlay':  '#565970',

      '--xr-text':     '#f8f8f2',
      '--xr-subtext':  '#bfc3d4',
      '--xr-muted':    '#6272a4',
      '--xr-faint':    '#44475a',

      '--xr-accent':       '#bd93f9',
      '--xr-accent-hover': '#caa6fc',
      '--xr-accent-muted': 'rgba(189, 147, 249, 0.12)',
      '--xr-accent-ring':  'rgba(189, 147, 249, 0.25)',

      '--xr-success':  '#50fa7b',
      '--xr-success-muted': 'rgba(80, 250, 123, 0.12)',
      '--xr-warning':  '#f1fa8c',
      '--xr-warning-muted': 'rgba(241, 250, 140, 0.12)',
      '--xr-error':    '#ff5555',
      '--xr-error-muted': 'rgba(255, 85, 85, 0.12)',
      '--xr-info':     '#8be9fd',
      '--xr-info-muted': 'rgba(139, 233, 253, 0.12)',

      '--xr-blue':     '#8be9fd',
      '--xr-green':    '#50fa7b',
      '--xr-red':      '#ff5555',
      '--xr-yellow':   '#f1fa8c',
      '--xr-orange':   '#ffb86c',
      '--xr-purple':   '#bd93f9',
      '--xr-cyan':     '#8be9fd',
      '--xr-pink':     '#ff79c6',

      '--xr-border':       'rgba(248, 248, 242, 0.08)',
      '--xr-border-hover': 'rgba(248, 248, 242, 0.14)',
      '--xr-border-active':'rgba(248, 248, 242, 0.2)',
      '--xr-ring':     '#6272a4',
      '--xr-divider':  'rgba(248, 248, 242, 0.05)',

      '--xr-shadow-sm':    '0 1px 2px rgba(0, 0, 0, 0.5)',
      '--xr-shadow':       '0 2px 8px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.5)',
      '--xr-shadow-lg':    '0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.4)',
      '--xr-shadow-xl':    '0 16px 64px rgba(0, 0, 0, 0.6), 0 8px 24px rgba(0, 0, 0, 0.4)',

      '--xr-radius-xs':  '3px',
      '--xr-radius-sm':  '4px',
      '--xr-radius':     '6px',
      '--xr-radius-md':  '8px',
      '--xr-radius-lg':  '10px',
      '--xr-radius-xl':  '12px',
      '--xr-radius-2xl': '16px',
      '--xr-radius-full':'9999px',

      '--xr-transition-fast':   '0.1s cubic-bezier(0.4, 0, 0.2, 1)',
      '--xr-transition':        '0.15s cubic-bezier(0.4, 0, 0.2, 1)',
      '--xr-transition-slow':   '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      '--xr-spring':            '0.4s cubic-bezier(0.16, 1, 0.3, 1)',

      '--xr-blur':        '12px',
      '--xr-blur-sm':     '8px',
      '--xr-blur-lg':     '20px',

      '--xr-dot-success': '#50fa7b',
      '--xr-dot-warning': '#f1fa8c',
      '--xr-dot-error':   '#ff5555',
      '--xr-dot-info':    '#8be9fd',
      '--xr-dot-muted':   '#44475a',
    }
  },
  'nord': {
    name: 'Nord',
    dot: '#88c0d0',
    vars: {
      '--xr-bg':       '#1a1e26',
      '--xr-bg2':      '#232830',
      '--xr-bg3':      '#2e3440',
      '--xr-surface':  '#3b4252',
      '--xr-elevated': '#434c5e',
      '--xr-overlay':  '#4c566a',

      '--xr-text':     '#eceff4',
      '--xr-subtext':  '#d8dee9',
      '--xr-muted':    '#7b88a1',
      '--xr-faint':    '#4c566a',

      '--xr-accent':       '#88c0d0',
      '--xr-accent-hover': '#9cd4e4',
      '--xr-accent-muted': 'rgba(136, 192, 208, 0.12)',
      '--xr-accent-ring':  'rgba(136, 192, 208, 0.25)',

      '--xr-success':  '#a3be8c',
      '--xr-success-muted': 'rgba(163, 190, 140, 0.12)',
      '--xr-warning':  '#ebcb8b',
      '--xr-warning-muted': 'rgba(235, 203, 139, 0.12)',
      '--xr-error':    '#bf616a',
      '--xr-error-muted': 'rgba(191, 97, 106, 0.12)',
      '--xr-info':     '#81a1c1',
      '--xr-info-muted': 'rgba(129, 161, 193, 0.12)',

      '--xr-blue':     '#81a1c1',
      '--xr-green':    '#a3be8c',
      '--xr-red':      '#bf616a',
      '--xr-yellow':   '#ebcb8b',
      '--xr-orange':   '#d08770',
      '--xr-purple':   '#b48ead',
      '--xr-cyan':     '#88c0d0',
      '--xr-pink':     '#b48ead',

      '--xr-border':       'rgba(236, 239, 244, 0.06)',
      '--xr-border-hover': 'rgba(236, 239, 244, 0.12)',
      '--xr-border-active':'rgba(236, 239, 244, 0.18)',
      '--xr-ring':     '#4c566a',
      '--xr-divider':  'rgba(236, 239, 244, 0.04)',

      '--xr-shadow-sm':    '0 1px 2px rgba(0, 0, 0, 0.4)',
      '--xr-shadow':       '0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.4)',
      '--xr-shadow-lg':    '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3)',
      '--xr-shadow-xl':    '0 16px 64px rgba(0, 0, 0, 0.5), 0 8px 24px rgba(0, 0, 0, 0.3)',

      '--xr-radius-xs':  '3px',
      '--xr-radius-sm':  '4px',
      '--xr-radius':     '6px',
      '--xr-radius-md':  '8px',
      '--xr-radius-lg':  '10px',
      '--xr-radius-xl':  '12px',
      '--xr-radius-2xl': '16px',
      '--xr-radius-full':'9999px',

      '--xr-transition-fast':   '0.1s cubic-bezier(0.4, 0, 0.2, 1)',
      '--xr-transition':        '0.15s cubic-bezier(0.4, 0, 0.2, 1)',
      '--xr-transition-slow':   '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      '--xr-spring':            '0.4s cubic-bezier(0.16, 1, 0.3, 1)',

      '--xr-blur':        '12px',
      '--xr-blur-sm':     '8px',
      '--xr-blur-lg':     '20px',

      '--xr-dot-success': '#a3be8c',
      '--xr-dot-warning': '#ebcb8b',
      '--xr-dot-error':   '#bf616a',
      '--xr-dot-info':    '#81a1c1',
      '--xr-dot-muted':   '#4c566a',
    }
  }
};

// Export as array for theme picker UI
window.XRAY_ThemesList = Object.entries(window.XRAY_Themes).map(([id, theme]) => ({
  id,
  ...theme
}));
