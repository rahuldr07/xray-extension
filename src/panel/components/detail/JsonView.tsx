import React from 'react';
import { safeStringify } from '../../utils';

export function JsonView({ value }: { value: unknown }): React.ReactElement {
  return <pre className="xray-json">{safeStringify(value)}</pre>;
}
