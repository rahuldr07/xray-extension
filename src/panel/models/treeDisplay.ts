// Display nodes the JSON viewer (components/detail/JsonView.tsx) renders as they are, for
// values that are not plain JSON: a typed log value such as `10n`, `ƒ load()` or `Map(3)`
// (models/logValue.ts builds them from the typed log model). They exist only at render
// time — never stored, persisted or exported — and, being class instances made by the
// panel, no captured value can pose as one.

/**
 * Colour of a leaf: the JSON value classes plus `typed` (functions, Symbols, Dates, DOM), `muted`
 * (notes) and `source` (a function's source text, shown as written over several lines).
 */
export type TreeTone = 'string' | 'number' | 'bool' | 'null' | 'typed' | 'muted' | 'source';

/** A value shown as one line of text. */
export class TreeLeaf {
  readonly text: string;
  readonly tone: TreeTone;
  /** A tooltip (a lazy getter's "not run" note). */
  readonly hint?: string;

  constructor(text: string, tone: TreeTone, hint?: string) {
    this.text = text;
    this.tone = tone;
    if (hint) this.hint = hint;
  }

  /** The viewer's flat-text fallback (and Copy raw) print the text, not the node. */
  toJSON(): string {
    return this.text;
  }
}

/**
 * One child of a branch. `key` is its path segment and React key, unique within the
 * branch (an index for arrays, Sets, Map entries and listed entries). `name` is a property
 * name shown as an ordinary key (`"message": …`) — an object envelope may list a key twice
 * and an Error's own `message` sits beside its message field, so names need not be unique.
 * `label` is shown verbatim instead (`"k" =>`; '' shows no key, for a "… 3 more" note).
 */
export interface TreeChild {
  key: string | number;
  value: unknown;
  name?: string;
  label?: string;
}

/** What the console Tree (consoleResults.resultDisplay) adds to a branch. */
export interface TreeBranchOptions {
  /** The typed value the branch shows, for its collapsed one-line preview (consolePreview.previewLine). */
  source?: unknown;
  /** Collapsed by default whatever its size (a DOM node, a function's source). */
  closed?: boolean;
  /** A `[0 … 99]` group of a big array's items: no brackets, its children keep their real indices. */
  bucket?: boolean;
  /** Shown without brackets (a function and its source text). */
  bare?: boolean;
}

/** An expandable value: an array-like or object-like container with an optional label (`Map(3)`, `Point`, `TypeError`). */
export class TreeBranch {
  readonly kind: 'array' | 'object';
  readonly label: string;
  readonly children: readonly TreeChild[];
  /** What the collapsed summary counts: a Map's size, a cut array's full length. */
  readonly count: number;
  readonly source?: unknown;
  readonly closed?: boolean;
  readonly bucket?: boolean;
  readonly bare?: boolean;

  constructor(kind: 'array' | 'object', label: string, children: readonly TreeChild[], count = children.length, options: TreeBranchOptions = {}) {
    this.kind = kind;
    this.label = label;
    this.children = children;
    this.count = count;
    if (options.source !== undefined) this.source = options.source;
    if (options.closed) this.closed = true;
    if (options.bucket) this.bucket = true;
    if (options.bare) this.bare = true;
  }

  toJSON(): unknown {
    // A big array's buckets print as the one array they group.
    if (this.kind === 'array') return this.children.flatMap((child) => (child.value instanceof TreeBranch && child.value.bucket ? child.value.children.map((item) => item.value) : [child.value]));
    const out: Record<string, unknown> = {};
    for (const child of this.children) {
      // A named child prints under its name, a labelled one under its label, a note ('' label) under "…".
      const key = child.name ?? (child.label === undefined ? String(child.key) : child.label || '…');
      Object.defineProperty(out, key, { value: child.value, enumerable: true, configurable: true, writable: true });
    }
    return out;
  }
}
