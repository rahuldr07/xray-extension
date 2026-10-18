import React from 'react';

/**
 * A labelled on/off option that looks like the Settings toggle but stays a real
 * checkbox, so it keeps native checkbox semantics, keyboard handling and name.
 */
export function ToggleField({ label, checked, disabled = false, onChange }: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange(checked: boolean): void;
}): React.ReactElement {
  return (
    <label className={`xray-toggle-field ${disabled ? 'disabled' : ''}`.trim()}>
      <input
        type="checkbox"
        className="xray-switch"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
