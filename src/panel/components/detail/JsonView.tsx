import React, { useMemo } from 'react';
import { safeStringify } from '../../utils';

interface JsonToken {
  text: string;
  className?: string;
}

const tokenPattern = /"(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\btrue\b|\bfalse\b|\bnull\b|[{}\[\],:]/g;

// Memoized: this renders inside virtualized rows that re-commit on every
// captured event, and stringify + tokenize of an 80k-char body is far too
// expensive to redo per commit while a detail happens to be expanded.
export const JsonView = React.memo(function JsonView({ value }: { value: unknown }): React.ReactElement {
  const { text, tokenLines } = useMemo(() => {
    const stringified = safeStringify(value);
    const lines = stringified.split('\n');
    return {
      text: stringified,
      tokenLines: lines.length > 600 ? null : lines.map((line) => tokenizeJsonLine(line)),
    };
  }, [value]);

  if (!tokenLines) return <pre className="xray-json xray-json-editor">{text}</pre>;
  return (
    <pre className="xray-json xray-json-editor" aria-label="JSON preview with line numbers">
      {tokenLines.map((tokens, index) => (
        <span key={index} className="xray-json-line">
          <span className="xray-json-line-no">{index + 1}</span>
          <span className="xray-json-line-text">
            {tokens.length ? tokens.map((token, tokenIndex) => (
              <span key={tokenIndex} className={token.className}>{token.text}</span>
            )) : ' '}
          </span>
        </span>
      ))}
    </pre>
  );
});

function tokenizeJsonLine(line: string): JsonToken[] {
  const tokens: JsonToken[] = [];
  let lastIndex = 0;
  tokenPattern.lastIndex = 0;

  for (let match = tokenPattern.exec(line); match; match = tokenPattern.exec(line)) {
    if (match.index > lastIndex) tokens.push({ text: line.slice(lastIndex, match.index) });
    const text = match[0];
    const after = line.slice(tokenPattern.lastIndex);
    tokens.push({ text, className: jsonTokenClass(text, after) });
    lastIndex = tokenPattern.lastIndex;
  }

  if (lastIndex < line.length) tokens.push({ text: line.slice(lastIndex) });
  return tokens;
}

function jsonTokenClass(text: string, after: string): string {
  if (text.startsWith('"')) return /^\s*:/.test(after) ? 'xray-json-key' : 'xray-json-string';
  if (text === 'true' || text === 'false') return 'xray-json-bool';
  if (text === 'null') return 'xray-json-null';
  if (/^-?\d/.test(text)) return 'xray-json-number';
  return 'xray-json-punct';
}
